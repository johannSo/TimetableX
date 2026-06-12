import type { Metadata } from "next";
import LegalDocument from "@/components/LegalDocument";

export const metadata: Metadata = {
  title: "Datenschutz | TimetableX",
  description: "Datenschutzerklärung von TimetableX.",
};

export default function DatenschutzPage() {
  return (
    <LegalDocument title="Datenschutzerklärung" subtitle="Stand: 02.06.2026">
      <section>
        <h2>1. Verantwortlicher</h2>
        <p>
          Jonathan Soppa
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
        <h2>2. Allgemeine Informationen</h2>
        <p>
          Der Schutz Ihrer personenbezogenen Daten ist mir wichtig. Diese Website kann
          grundsätzlich ohne Registrierung genutzt werden.
        </p>
        <p>
          Für die Webanalyse wird ein Cookie-Banner eingesetzt. Analyse-Cookies können
          abgelehnt werden; in diesem Fall wird Umami nicht aktiviert.
        </p>
      </section>

      <section>
        <h2>3. Hosting</h2>
        <p>
          Diese Website wird auf einem selbst verwalteten Server betrieben.
        </p>
        <p>
          Zur Bereitstellung der Website können technisch notwendige Verbindungsdaten
          verarbeitet werden. Die Verarbeitung erfolgt ausschließlich zur
          Gewährleistung der Sicherheit, Stabilität und Funktionsfähigkeit der Website.
        </p>
      </section>

      <section>
        <h2>4. Cloudflare</h2>
        <p>
          Für DNS- und Sicherheitsfunktionen wird Cloudflare eingesetzt.
        </p>
        <p>
          Cloudflare kann technisch notwendige Verbindungsdaten verarbeiten, um die
          sichere Auslieferung der Website zu gewährleisten.
        </p>
        <p>
          Weitere Informationen finden Sie in der Datenschutzerklärung von Cloudflare.
        </p>
      </section>

      <section>
        <h2>5. Webanalyse mit Umami</h2>
        <p>
          Diese Website verwendet ein selbst gehostetes Umami zur Analyse der Nutzung
          der Website und zur Verbesserung des Angebots, sofern Sie der Analyse
          zugestimmt haben.
        </p>
        <p>Dabei können insbesondere folgende Informationen verarbeitet werden:</p>
        <ul>
          <li>aufgerufene Seiten</li>
          <li>Browser- und Geräteinformationen</li>
          <li>technische Nutzungsdaten</li>
          <li>Interaktionen innerhalb der Website</li>
        </ul>
        <p>
          Umami wird auf einem eigenen Server betrieben. Es werden keine Daten an
          Drittanbieter übermittelt. Umami arbeitet ohne Cookies und ohne dauerhafte
          Identifizierung einzelner Geräte.
        </p>
        <p>
          Die Analyse dient ausschließlich der Verbesserung der Website und ihrer
          Funktionen.
        </p>
      </section>

      <section>
        <h2>6. Weitergabe von Daten</h2>
        <p>
          Eine Weitergabe personenbezogener Daten erfolgt nur, soweit dies zur
          technischen Bereitstellung der Website erforderlich ist oder eine gesetzliche
          Verpflichtung besteht.
        </p>
      </section>

      <section>
        <h2>7. Rechte der betroffenen Personen</h2>
        <p>
          Sie haben nach der Datenschutz-Grundverordnung (DSGVO) das Recht auf:
        </p>
        <ul>
          <li>Auskunft</li>
          <li>Berichtigung</li>
          <li>Löschung</li>
          <li>Einschränkung der Verarbeitung</li>
          <li>Datenübertragbarkeit</li>
          <li>Widerspruch gegen die Verarbeitung</li>
        </ul>
        <p>
          Außerdem haben Sie das Recht, sich bei einer Datenschutzaufsichtsbehörde zu
          beschweren.
        </p>
      </section>

      <section>
        <h2>8. Kontakt</h2>
        <p>Bei Fragen zum Datenschutz können Sie sich an folgende Adresse wenden:</p>
        <p>
          <a href="mailto:support@timetablex.space">support@timetablex.space</a>
        </p>
      </section>

      <section>
        <h2>9. Änderungen dieser Datenschutzerklärung</h2>
        <p>
          Diese Datenschutzerklärung kann angepasst werden, wenn sich technische oder
          rechtliche Anforderungen ändern.
        </p>
      </section>
    </LegalDocument>
  );
}
