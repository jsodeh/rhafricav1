import React from "react";
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

  const handleSuccess = () => {
    onSuccess?.();
    // Auto-close modal after success (with a small delay for UX)
    setTimeout(() => {
      onClose();
    }, 2000);
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
      <Drawer open={isOpen} onOpenChange={onClose}>
        <DrawerContent className="max-h-[85vh]">
          <DrawerHeader className="text-left">
            <div className="flex items-center justify-between">
              <div>
                <DrawerTitle>{title || "Contact Form"}</DrawerTitle>
                {description && (
                  <DrawerDescription>{description}</DrawerDescription>
                )}
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={onClose}
                className="h-8 w-8 p-0"
              >
                <X className="h-4 w-4" />
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
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px] max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle>{title || "Contact Form"}</DialogTitle>
              {description && (
                <DialogDescription>{description}</DialogDescription>
              )}
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="h-8 w-8 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>
        {formContent}
      </DialogContent>
    </Dialog>
  );
};

export default ContactFormModal;
