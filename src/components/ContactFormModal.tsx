import React, { useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import ContactForm, { ContactFormProps, ContactFormData } from "./ContactForm";
import { useIsMobile } from "@/hooks/use-mobile";
import { useFocusTrap } from "@/hooks/useFocusTrap";
import { announceFocusChange } from "@/lib/accessibility/focusManagement";

interface ContactFormModalProps extends Omit<ContactFormProps, "embedded"> {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
}

const ContactFormModal: React.FC<ContactFormModalProps> = ({
  isOpen,
  onClose,
  title,
  description,
  onSuccess,
  ...contactFormProps
}) => {
  const isMobile = useIsMobile();
  const focusTrapRef = useFocusTrap({ isActive: isOpen });

  // Announce modal state changes
  useEffect(() => {
    if (isOpen) {
      announceFocusChange(`${title || "Contact form"} dialog opened`, 'assertive');
    }
  }, [isOpen, title]);

  const handleSuccess = () => {
    onSuccess?.();
    announceFocusChange("Form submitted successfully", 'assertive');
    // Auto-close modal after success (with a small delay for UX)
    setTimeout(() => {
      onClose();
    }, 2000);
  };

  const handleClose = () => {
    announceFocusChange("Dialog closed", 'polite');
    onClose();
  };

  const formContent = (
    <ContactForm
      {...contactFormProps}
      embedded={true}
      onSuccess={handleSuccess}
      className="border-0 shadow-none"
    />
  );

  // Use drawer on mobile, dialog on desktop
  if (isMobile) {
    return (
      <Drawer open={isOpen} onOpenChange={handleClose}>
        <DrawerContent 
          ref={focusTrapRef}
          className="max-h-[85vh]"
          role="dialog"
          aria-labelledby="drawer-title"
          aria-describedby={description ? "drawer-description" : undefined}
        >
          <DrawerHeader className="text-left">
            <div className="flex items-center justify-between">
              <div>
                <DrawerTitle id="drawer-title">{title || "Contact Form"}</DrawerTitle>
                {description && (
                  <DrawerDescription id="drawer-description">{description}</DrawerDescription>
                )}
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleClose}
                className="h-8 w-8 p-0"
                aria-label="Close contact form"
              >
                <X className="h-4 w-4" aria-hidden="true" />
              </Button>
            </div>
          </DrawerHeader>
          <div className="px-4 pb-4 overflow-y-auto">
            {formContent}
          </div>
        </DrawerContent>
      </Drawer>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent 
        ref={focusTrapRef}
        className="sm:max-w-[500px] max-h-[85vh] overflow-y-auto"
        role="dialog"
        aria-labelledby="dialog-title"
        aria-describedby={description ? "dialog-description" : undefined}
      >
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle id="dialog-title">{title || "Contact Form"}</DialogTitle>
              {description && (
                <DialogDescription id="dialog-description">{description}</DialogDescription>
              )}
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClose}
              className="h-8 w-8 p-0"
              aria-label="Close contact form"
            >
              <X className="h-4 w-4" aria-hidden="true" />
            </Button>
          </div>
        </DialogHeader>
        {formContent}
      </DialogContent>
    </Dialog>
  );
};

export default ContactFormModal;
