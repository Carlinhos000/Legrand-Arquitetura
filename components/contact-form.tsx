"use client";
import { useRef, useState, type FormEvent } from "react";
import { CheckCircle2, LoaderCircle, MessageCircle } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { business } from "@/lib/legrand-content";

type Values = { name: string; email: string; phone: string; type: string; message: string };
const initial: Values = { name: "", email: "", phone: "", type: "", message: "" };
const fieldLabels: Record<keyof Values, string> = { name: "Nome", email: "E-mail", phone: "Telefone", type: "Tipo de projeto", message: "Mensagem" };

function validate(key: keyof Values, value: string) {
  if (!value.trim()) return `Preencha ${fieldLabels[key].toLowerCase()}.`;
  if (key === "name" && value.trim().length < 2) return "Informe seu nome com pelo menos 2 caracteres.";
  if (key === "email" && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return "Informe um e-mail válido.";
  if (key === "phone" && !/^\+?[\d\s().-]+$/.test(value)) return "Use apenas números e os sinais do telefone.";
  if (key === "phone" && (value.replace(/\D/g, "").length < 10 || value.replace(/\D/g, "").length > 13)) return "Informe um telefone com DDD válido.";
  if (key === "message" && value.trim().length < 10) return "Conte um pouco mais, com pelo menos 10 caracteres.";
  return "";
}

export function ContactForm() {
  const [values, setValues] = useState<Values>(initial);
  const [errors, setErrors] = useState<Partial<Record<keyof Values, string>>>({});
  const [status, setStatus] = useState<"idle" | "sending" | "success" | "error">("idle");
  const formRef = useRef<HTMLFormElement>(null);
  function change(key: keyof Values, value: string) {
    setValues(prev => ({ ...prev, [key]: value }));
    if (errors[key]) setErrors(prev => ({ ...prev, [key]: validate(key, value) }));
    if (status !== "sending") setStatus("idle");
  }
  function blur(key: keyof Values) { setErrors(prev => ({ ...prev, [key]: validate(key, values[key]) })); }
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (status === "sending") return;
    const next: Partial<Record<keyof Values, string>> = {};
    (Object.keys(values) as (keyof Values)[]).forEach(key => { const error = validate(key, values[key]); if (error) next[key] = error; });
    setErrors(next);
    const invalid = (Object.keys(next) as (keyof Values)[])[0];
    if (invalid) { setStatus("error"); document.getElementById(`contact-${invalid}`)?.focus(); return; }
    setStatus("sending");
    await new Promise(resolve => window.setTimeout(resolve, 800));
    setStatus("success");
  }
  const whatsappMessage = `Olá, sou ${values.name}. Tenho interesse em ${values.type.toLowerCase()}. ${values.message}`;
  return <form className="contact-form" ref={formRef} onSubmit={submit} noValidate aria-labelledby="form-heading">
    <h3 id="form-heading">Conte-nos sua ideia.</h3>
    <p className="form-intro">O primeiro passo é uma boa conversa.</p>
    <div className="form-grid">
      {(["name", "email", "phone"] as const).map(key => <div className={`field ${key === "name" ? "wide" : ""}`} key={key}>
        <label htmlFor={`contact-${key}`}>{fieldLabels[key]} <span aria-hidden="true">*</span></label>
        <input id={`contact-${key}`} name={key} type={key === "email" ? "email" : key === "phone" ? "tel" : "text"} autoComplete={key === "phone" ? "tel" : key} placeholder={key === "name" ? "Como podemos chamar você?" : key === "email" ? "voce@exemplo.com" : "(47) 99999-9999"} maxLength={key === "name" ? 100 : key === "phone" ? 20 : 254} value={values[key]} disabled={status === "sending"} required aria-invalid={!!errors[key]} aria-describedby={errors[key] ? `error-${key}` : undefined} onChange={e => change(key, e.target.value)} onBlur={() => blur(key)} />
        {errors[key] && <p className="field-error" id={`error-${key}`}>{errors[key]}</p>}
      </div>)}
      <div className="field wide"><label htmlFor="contact-type">Tipo de projeto <span aria-hidden="true">*</span></label>
        <Select name="type" value={values.type} onValueChange={value => change("type", value)} disabled={status === "sending"}>
          <SelectTrigger id="contact-type" className="project-select" aria-required="true" aria-invalid={!!errors.type} aria-describedby={errors.type ? "error-type" : undefined}><SelectValue placeholder="Selecione uma opção" /></SelectTrigger>
          <SelectContent position="popper" className="project-options">{["Arquitetura residencial", "Arquitetura comercial", "Interiores", "Planejamento de ambientes", "Consultoria"].map(type => <SelectItem key={type} value={type}>{type}</SelectItem>)}</SelectContent>
        </Select>{errors.type && <p className="field-error" id="error-type">{errors.type}</p>}
      </div>
      <div className="field wide"><label htmlFor="contact-message">Mensagem <span aria-hidden="true">*</span></label><textarea id="contact-message" name="message" rows={3} maxLength={2000} placeholder="Fale sobre o espaço que você deseja transformar…" value={values.message} disabled={status === "sending"} required aria-invalid={!!errors.message} aria-describedby={errors.message ? "error-message" : undefined} onChange={e => change("message", e.target.value)} onBlur={() => blur("message")} />{errors.message && <p className="field-error" id="error-message">{errors.message}</p>}</div>
    </div>
    <button type="submit" className="button light form-submit" disabled={status === "sending"}>{status === "sending" && <LoaderCircle size={18} className="spin"/>}{status === "sending" ? "Validando mensagem…" : "Enviar mensagem"}</button>
    <p className="demo-notice">Formulário demonstrativo: os dados não são enviados nem armazenados. Para atendimento, fale pelo WhatsApp.</p>
    <div aria-live="polite" aria-atomic="true">{status === "error" && <p className="form-feedback error">Revise os campos indicados para continuar.</p>}{status === "success" && <div className="form-feedback success"><p><CheckCircle2 size={19} aria-hidden="true"/>Mensagem validada na demonstração. Nenhum dado foi enviado.</p><a href={`https://wa.me/5547997454497?text=${encodeURIComponent(whatsappMessage)}`} target="_blank" rel="noopener noreferrer"><MessageCircle size={16} aria-hidden="true"/>Continuar pelo WhatsApp</a></div>}</div>
  </form>;
}
