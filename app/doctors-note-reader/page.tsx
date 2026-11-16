import type { Metadata } from "next";
import { FileText, Globe, Images, Lock, MapPinned, ScanText, ShieldCheck, Stethoscope } from "lucide-react";
import { InfoPage } from "@/components/marketing/InfoPage";

const title = "Read a doctor's handwriting, prescription or referral note";
const description =
  "Upload a photo of a doctor's note, prescription, referral card or lab result. Zelthia reads the handwriting, explains it in plain language, and finds where to get the test, scan or medicine near you in Nigeria.";

export const metadata: Metadata = {
  title,
  description,
  keywords: [
    "read doctor's handwriting",
    "doctor handwriting reader",
    "explain my prescription",
    "understand referral letter",
    "what does my lab result mean",
    "where to do 2D echo scan",
    "where to do MRI scan Nigeria",
    "prescription reader app",
  ],
  alternates: { canonical: "/doctors-note-reader" },
  openGraph: { title: `${title} | Zelthia`, description, url: "/doctors-note-reader" },
};

export default function DoctorsNoteReaderPage() {
  return (
    <InfoPage
      path="/doctors-note-reader"
      title={title}
      lead="Take a photo of the note. Zelthia reads it, tells you what it says and what to do next, and finds where to get the test or medicine."
      primary={{ href: "/chat", label: "Upload a note" }}
      secondary={{ href: "/signup", label: "Create a free account" }}
      summary={[
        "Zelthia is a health assistant that can read photos and PDFs of medical documents, including handwritten doctor's notes, prescriptions, referral or transfer cards, lab results and scan reports. It writes out what the document says, expands medical shorthand such as \"2D ECHO\" or \"bd\", and explains it in plain language.",
        "If the note asks for a test, scan or medicine, Zelthia then looks for where to get it: first in facilities listed on Zelthia, then on the web, with links and photos. It tells you plainly when it finds nothing, and never invents a facility.",
      ]}
      sectionsTitle="What happens when you upload a note"
      sections={[
        { icon: ScanText, title: "It reads the handwriting", body: "Every word it can make out is written down, and anything unreadable is marked rather than guessed." },
        { icon: FileText, title: "It explains the shorthand", body: "Abbreviations like c/o, Rx, bd, 2D ECHO or MRI LS spine are spelled out and explained." },
        { icon: Stethoscope, title: "It tells you the next step", body: "What the doctor is asking you to do, what the test involves and how to prepare." },
        { icon: MapPinned, title: "It finds where to go", body: "Facilities on Zelthia that offer it, with phone, opening hours and directions by landmarks." },
        { icon: Globe, title: "It searches the web too", body: "When nothing is listed on Zelthia, it finds pages from clinics and pharmacies and links to them." },
        { icon: Images, title: "It shows photos", body: "Product and place photos from the web, each linked to the page it came from." },
        { icon: ShieldCheck, title: "It checks your allergies", body: "If you have saved a health profile, medicines in the note are checked against your allergies and current medicines." },
        { icon: Lock, title: "Your files stay private", body: "Uploads are stored privately and only you can open them. Use a temporary chat to keep nothing." },
      ]}
      steps={{
        title: "How to get a doctor's note explained",
        items: [
          { name: "Open the health chat", text: "No account is needed to try it. Sign in if you want to keep the conversation." },
          { name: "Attach a photo or PDF", text: "Tap the plus button, choose the photo or take one. Clear, well-lit photos work best." },
          { name: "Read the explanation", text: "Zelthia shows what it read, what it means and where to get the test or medicine near you." },
        ],
      }}
      faqs={[
        { question: "Can Zelthia read a doctor's handwriting?", answer: "Yes. Upload a photo and Zelthia transcribes the handwriting, marks anything it can't read, and explains the note in plain language. Always confirm doses with a pharmacist or your doctor." },
        { question: "What files can I upload?", answer: "Photos (JPG, PNG, WebP, HEIC), PDFs and text files, up to 3 MB each and four per message." },
        { question: "Does it tell me where to do a scan or test?", answer: "Yes. If the note requests something like an X-ray, MRI or 2D echocardiogram, Zelthia looks for facilities that offer it near you and links to the sources it found." },
        { question: "Is it a replacement for my doctor?", answer: "No. Zelthia explains and helps you find care. It does not diagnose or prescribe. In an emergency call 112." },
        { question: "Who can see the documents I upload?", answer: "Only you. Files are stored privately and served only to your account. Deleting a chat or your account deletes its files. Guest and temporary chats are not saved." },
        { question: "Is it free?", answer: "Yes, reading notes and asking questions is free for patients." },
      ]}
      related={[
        { href: "/chat", label: "Health chat" },
        { href: "/inventory", label: "Find medicine" },
        { href: "/about", label: "About Zelthia" },
      ]}
    />
  );
}
