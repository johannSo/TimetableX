import type { Metadata } from "next";
import LegalDocument from "@/components/LegalDocument";

export const metadata: Metadata = {
  title: "Impressum | TimetableX",
  description: "Impressum von TimetableX.",
};

export default function ImpressumPage() {
  return (
    <LegalDocument title="Impressum">
      <section>
        <h2>Angaben gemäß § 5 DDG</h2>
        <p>
          Jonathan Soppa
          <br />
          Gerda Hilft Schülerfirma
          <br />
          Telemannstraße 9
          <br />
          04317 Leipzig
          <br />
          Deutschland
        </p>
        <p>
          E-Mail:{" "}
          <a href="mailto:support@timetablex.space">support@timetablex.space</a>
        </p>
      </section>

      <section>
        <h2>Verantwortlich für den Inhalt nach § 18 Abs. 2 MStV</h2>
        <p>
          Jonathan Soppa
          <br />
          Telemannstraße 9
          <br />
          04317 Leipzig
        </p>
      </section>
    </LegalDocument>
  );
}
