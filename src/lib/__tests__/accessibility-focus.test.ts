import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { 
  getFocusableElements, 
  FocusTrap, 
  createFocusTrap,
  setTabOrder,
  removeFromTabOrder,
  addToTabOrder,
  createSkipLink,
  announceFocusChange,
  FocusVisibleManager
} from '../accessibility/focusManagement';

// Mock DOM methods
Object.defineProperty(window, 'getComputedStyle', {
  value: vi.fn(() => ({
    display: 'block',
    visibility: 'visible',
  })),
});

describe('Focus Management Utilities', () => {
  let container: HTMLElement;

  beforeEach(() => {
    document.body.innerHTML = '';
    container = document.createElement('div');
    document.body.appendChild(container);
  });

  afterEach(() => {
    document.body.innerHTML = '';
  });

  describe('getFocusableElements', () => {
    it('should find focusable elements', () => {
      container.innerHTML = `
        <button>Button 1</button>
        <input type="text" />
        <a href="#">Link</a>
        <div tabindex="0">Focusable div</div>
        <button disabled>Disabled button</button>
        <div>Non-focusable div</div>
      `;

      const focusableElements = getFocusableElements(container);
      expect(focusableElements).toHaveLength(4); // button, input, link, div with tabindex
    });

    it('should exclude hidden elements', () => {
      container.innerHTML = `
        <button>Visible button</button>
        <button style="display: none;">Hidden button</button>
        <button aria-hidden="true">ARIA hidden button</button>
      `;

      // Mock getComputedStyle to return different values
      (window.getComputedStyle as any).mockImplementation((element: HTMLElement) => {
        if (element.style.display === 'none') {
          return { display: 'none', visibility: 'visible' };
        }
        return { display: 'block', visibility: 'visible' };
      });

      const focusableElements = getFocusableElements(container);
      expect(focusableElements).toHaveLength(1); // Only visible button
    });
  });

  describe('FocusTrap', () => {
    let focusTrap: FocusTrap;

    beforeEach(() => {
      container.innerHTML = `
        <button id="first">First</button>
        <input id="middle" type="text" />
        <button id="last">Last</button>
      `;
      focusTrap = new FocusTrap(container);
    });

    it('should create focus trap', () => {
      expect(focusTrap).toBeInstanceOf(FocusTrap);
      expect(focusTrap.isActivated()).toBe(false);
    });

    it('should activate and focus first element', () => {
      const firstButton = container.querySelector('#first') as HTMLButtonElement;
      const focusSpy = vi.spyOn(firstButton, 'focus');

      focusTrap.activate();

      expect(focusTrap.isActivated()).toBe(true);
      expect(focusSpy).toHaveBeenCalled();
    });

    it('should deactivate and restore focus', () => {
      const externalButton = document.createElement('button');
      document.body.appendChild(externalButton);
      externalButton.focus();

      const restoreFocusSpy = vi.spyOn(externalButton, 'focus');

      focusTrap.activate();
      focusTrap.deactivate();

      expect(focusTrap.isActivated()).toBe(false);
      expect(restoreFocusSpy).toHaveBeenCalledTimes(2); // Once initially, once on restore
    });

    it('should handle tab key to trap focus', () => {
      focusTrap.activate();

      const lastButton = container.querySelector('#last') as HTMLButtonElement;
      const firstButton = container.querySelector('#first') as HTMLButtonElement;
      
      lastButton.focus();
      const focusSpy = vi.spyOn(firstButton, 'focus');

      // Simulate Tab key on last element
      const tabEvent = new KeyboardEvent('keydown', { key: 'Tab' });
      Object.defineProperty(tabEvent, 'target', { value: lastButton });
      Object.defineProperty(document, 'activeElement', { value: lastButton });
      
      document.dispatchEvent(tabEvent);

      // Focus should move to first element (trapped)
      expect(focusSpy).toHaveBeenCalled();
    });
  });

  describe('createFocusTrap', () => {
    it('should create a FocusTrap instance', () => {
      const trap = createFocusTrap(container);
      expect(trap).toBeInstanceOf(FocusTrap);
    });
  });

  describe('Tab Order Management', () => {
    beforeEach(() => {
      container.innerHTML = `
        <button id="btn1">Button 1</button>
        <button id="btn2">Button 2</button>
        <button id="btn3">Button 3</button>
      `;
    });

    it('should set tab order', () => {
      const buttons = Array.from(container.querySelectorAll('button')) as HTMLElement[];
      setTabOrder(buttons, 1);

      expect(buttons[0].getAttribute('tabindex')).toBe('1');
      expect(buttons[1].getAttribute('tabindex')).toBe('2');
      expect(buttons[2].getAttribute('tabindex')).toBe('3');
    });

    it('should remove from tab order', () => {
      const button = container.querySelector('#btn1') as HTMLElement;
      removeFromTabOrder(button);

      expect(button.getAttribute('tabindex')).toBe('-1');
    });

    it('should add to tab order', () => {
      const button = container.querySelector('#btn1') as HTMLElement;
      addToTabOrder(button, 5);

      expect(button.getAttribute('tabindex')).toBe('5');
    });
  });

  describe('createSkipLink', () => {
    it('should create skip link with proper attributes', () => {
      const skipLink = createSkipLink('main-content', 'Skip to main content');

      expect(skipLink.tagName).toBe('A');
      expect(skipLink.getAttribute('href')).toBe('#main-content');
      expect(skipLink.textContent).toBe('Skip to main content');
      expect(skipLink.getAttribute('aria-label')).toBe('Skip to skip to main content');
      expect(skipLink.className).toBe('skip-link');
    });

    it('should focus target element on click', () => {
      const target = document.createElement('div');
      target.id = 'main-content';
      target.setAttribute('tabindex', '-1');
      document.body.appendChild(target);

      const focusSpy = vi.spyOn(target, 'focus');
      const scrollSpy = vi.spyOn(target, 'scrollIntoView');

      const skipLink = createSkipLink('main-content', 'Skip to main content');
      
      const clickEvent = new MouseEvent('click', { bubbles: true });
      skipLink.dispatchEvent(clickEvent);

      expect(focusSpy).toHaveBeenCalled();
      expect(scrollSpy).toHaveBeenCalledWith({ behavior: 'smooth', block: 'start' });
    });
  });

  describe('announceFocusChange', () => {
    it('should create announcement element', () => {
      announceFocusChange('Test announcement', 'polite');

      const announcement = document.querySelector('[aria-live="polite"]');
      expect(announcement).toBeTruthy();
      expect(announcement?.textContent).toBe('Test announcement');
      expect(announcement?.getAttribute('aria-atomic')).toBe('true');
      expect(announcement?.className).toBe('sr-only');
    });

    it('should remove announcement after timeout', (done) => {
      announceFocusChange('Test announcement', 'assertive');

      const announcement = document.querySelector('[aria-live="assertive"]');
      expect(announcement).toBeTruthy();

      setTimeout(() => {
        const removedAnnouncement = document.querySelector('[aria-live="assertive"]');
        expect(removedAnnouncement).toBeFalsy();
        done();
      }, 1100); // Slightly longer than the 1000ms timeout
    });
  });

  describe('FocusVisibleManager', () => {
    let manager: FocusVisibleManager;

    beforeEach(() => {
      manager = new FocusVisibleManager();
    });

    afterEach(() => {
      manager.destroy();
    });

    it('should track keyboard usage', () => {
      expect(manager.isUsingKeyboard()).toBe(false);

      // Simulate Tab key
      const tabEvent = new KeyboardEvent('keydown', { key: 'Tab' });
      document.dispatchEvent(tabEvent);

      expect(manager.isUsingKeyboard()).toBe(true);
      expect(document.body.classList.contains('keyboard-user')).toBe(true);
    });

    it('should reset keyboard state on mouse interaction', () => {
      // First set keyboard state
      const tabEvent = new KeyboardEvent('keydown', { key: 'Tab' });
      document.dispatchEvent(tabEvent);
      expect(manager.isUsingKeyboard()).toBe(true);

      // Then simulate mouse interaction
      const mouseEvent = new MouseEvent('mousedown');
      document.dispatchEvent(mouseEvent);

      expect(document.body.classList.contains('keyboard-user')).toBe(false);
    });

    it('should add focus-visible class on keyboard focus', () => {
      const button = document.createElement('button');
      document.body.appendChild(button);

      // Set keyboard state
      const tabEvent = new KeyboardEvent('keydown', { key: 'Tab' });
      document.dispatchEvent(tabEvent);

      // Simulate focus
      const focusEvent = new FocusEvent('focusin', { target: button } as any);
      document.dispatchEvent(focusEvent);

      expect(button.classList.contains('focus-visible')).toBe(true);
    });

    it('should remove focus-visible class on blur', () => {
      const button = document.createElement('button');
      button.classList.add('focus-visible');
      document.body.appendChild(button);

      // Simulate blur
      const blurEvent = new FocusEvent('focusout', { target: button } as any);
      document.dispatchEvent(blurEvent);

      expect(button.classList.contains('focus-visible')).toBe(false);
    });
  });
});