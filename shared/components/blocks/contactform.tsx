// contactform component file

"use client";

import { urlFor } from "@/shared/sanity/lib/image";
import { Image } from "sanity"; // Import the Image type from Sanity
import PortableTextRenderer from "@/shared/components/portable-text-renderer";
import { Button } from "../ui/button";

import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/shared/components/ui/dialog";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import { Textarea } from "../ui/textarea";
import { useRef, useState } from "react";
import { toast } from "sonner";
import { PAGE_QUERYResult } from "@/sanity.types";
import HCaptcha from "@hcaptcha/react-hcaptcha";
import { usePathname } from "next/navigation";

type ContactFormProps = Extract<
  NonNullable<NonNullable<PAGE_QUERYResult>["blocks"]>[number],
  { _type: "contactform" }
>;

function ContactForm({
  title,
  description,
  button_text,
  side_image,
}: ContactFormProps) {
  // Recupera il pathname lato client e determina la lingua
  const pathname = usePathname() || "/";
  const isEn = pathname === "/en" || pathname.startsWith("/en/");

  let imageUrl =
    side_image && side_image.asset?._id ? urlFor(side_image).url() : "";
  let captchaRef = useRef<HCaptcha>(null);

  let [hCaptchaToken, setHCaptchaToken] = useState<string | null>(null);
  let [formData, setFormData] = useState({
    email: "",
    name: "",
    surname: "",
    business_name: "",
    request: "",
    description: "",
  });

  function handleSubmit(e: any) {
    e.preventDefault();

    if (!hCaptchaToken) {
      toast(isEn ? "hCAPTCHA verification failed, please complete the hCAPTCHA." : "Verifica hCAPTCHA fallita, Per favore, completa il hCAPTCHA.");
      return;
    }

    console.log('Submitting form with hCaptcha token:', {
      hasToken: !!hCaptchaToken,
      tokenLength: hCaptchaToken?.length,
      tokenPreview: hCaptchaToken ? `${hCaptchaToken.substring(0, 20)}...` : 'none'
    });

    fetch("/api/contactform", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: formData.email,
        name: formData.name,
        surname: formData.surname,
        business_name: formData.business_name,
        request: formData.request,
        description: formData.description,
        lang: isEn ? "en" : "it",
        "h-captcha-response": hCaptchaToken,
      }),
    })
    .then(async (response) => {
      const data = await response.json();
      if (!response.ok) {
        console.error('Form submission error:', {
          status: response.status,
          statusText: response.statusText,
          data
        });
        
        // Se il problema è hCaptcha, resetta e forza una nuova verifica
        if (data.error && (data.error.includes('hCaptcha') || data.error.includes('captcha'))) {
          console.log('Captcha error detected, resetting captcha');
          captchaRef.current?.resetCaptcha();
          setHCaptchaToken(null);
        }
        
        throw new Error(data.error || `HTTP ${response.status}: ${response.statusText}`);
      }
      return data;
    })
    .then((data) => {
      toast(
        isEn
          ? "Contact request successfully registered, you will be contacted shortly by one of our operators"
          : "Richiesta di contatto registrata con successo, a breve verrà contattato da uno dei nostri operatori"
      );
    }).catch((error) => {
      console.error('Form submission failed:', error);
      toast(isEn ? `Error: ${error.message || 'An error occurred while submitting the contact request. Please try again later.'}` : `Errore: ${error.message || 'Si è verificato un errore durante l\'invio della richiesta di contatto. Per favore, riprova più tardi.'}`);
    })
    .finally(() => {
      setFormData({
        email: "",
        name: "",
        surname: "",
        business_name: "",
        request: "",
        description: "",
      });
      captchaRef.current?.resetCaptcha();
      setHCaptchaToken(null);
    });
  }

  function handleCaptchaSubmission(token: string | null) {
    console.log('New hCaptcha token received:', {
      hasToken: !!token,
      tokenLength: token?.length,
      tokenPreview: token ? `${token.substring(0, 20)}...` : 'none'
    });

    // Validazione robusta del token hCAPTCHA
    if (token && typeof token === 'string' && token.length > 20) {
      setHCaptchaToken(token);
      console.log('hCaptcha token saved, ready for submission');
    } else {
      setHCaptchaToken(null);
      console.log('Invalid or missing hCaptcha token');
    }
  }

  return (
    <Dialog>
      <div className="grid lg:grid-cols-2 bg-muted">
        <div
          className="bg-no-repeat bg-cover hidden lg:block"
          style={{
            backgroundImage: `url(${imageUrl})`,
            backgroundPosition: "-15% 30%",
          }}></div>
        <div className="flex flex-col px-8 py-16 gap-4">
          <h2 className="text-3xl font-bold">{title}</h2>
          <div className="lg:w-1/2">
            {description && <PortableTextRenderer value={description} />}
          </div>
          <DialogTrigger asChild className="lg:w-1/3">
            <Button>{button_text}</Button>
          </DialogTrigger>

          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>{isEn ? "Contact Us" : "Contattaci"}</DialogTitle>
              <DialogDescription></DialogDescription>
            </DialogHeader>
            <div className="flex flex-col gap-2">
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                />
              </div>
              <div>
                <Label htmlFor="name">{isEn ? "First Name" : "Nome"}</Label>
                <Input
                  id="name"
                  type="text"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                />
              </div>
              <div>
                <Label htmlFor="surname">{isEn ? "Last Name" : "Cognome"}</Label>
                <Input
                  id="surname"
                  type="text"
                  value={formData.surname}
                  onChange={(e) =>
                    setFormData({ ...formData, surname: e.target.value })
                  }
                />
              </div>
              <div>
                <Label htmlFor="business_name">{isEn ? "Business Name" : "Azienda"}</Label>
                <Input
                  id="business_name"
                  type="text"
                  value={formData.business_name}
                  onChange={(e) =>
                    setFormData({ ...formData, business_name: e.target.value })
                  }
                />
              </div>
              <div>
                <Label htmlFor="request">{isEn ? "Request" : "Richiesta"}</Label>
                <Input
                  id="request"
                  type="text"
                  value={formData.request}
                  onChange={(e) =>
                    setFormData({ ...formData, request: e.target.value })
                  }
                />
              </div>
              <div>
                <Label htmlFor="description">{isEn ? "Description" : "Descrizione"}</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                />
              </div>
              <div>
                <HCaptcha
                  ref={captchaRef}
                  sitekey={process.env.NEXT_PUBLIC_HCAPTCHA_SITE_KEY!}
                  onVerify={handleCaptchaSubmission}
                  onExpire={() => {
                    setHCaptchaToken(null);
                  }}
                  onError={() => {
                    setHCaptchaToken(null);
                  }}
                />
                <p className="text-xs my-2">
                  {isEn
                    ? 'By clicking "Send" you acknowledge that you have read the privacy policy regarding the processing of personal data.'
                    : 'Cliccando "Invia" si dichiara di aver preso visione dell’informativa per il trattamento dei dati personali.'}
                </p>
              </div>
              <Button
                type="submit"
                size="sm"
                className="px-3"
                onClick={handleSubmit}
                disabled={!hCaptchaToken}
              >
                {isEn ? "Send" : "Invia"}
              </Button>
            </div>
            <DialogFooter className="sm:justify-end">
              <DialogClose asChild>
                <Button type="button" variant="secondary">
                  {isEn ? "Close" : "Chiudi"}
                </Button>
              </DialogClose>
            </DialogFooter>
          </DialogContent>
        </div>
      </div>
    </Dialog>
  );
}
export default ContactForm;
