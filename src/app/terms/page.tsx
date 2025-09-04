import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Termeni și Condiții | Standupovka',
  description: 'Termenii și condițiile de utilizare pentru platforma Standupovka - regulile și responsabilitățile pentru utilizarea serviciului nostru.',
}

export default function TermsAndConditionsPage() {
  return (
    <div className="min-h-screen bg-[#0A0A0A] text-[#F2F2F2]">
      <div className="container mx-auto px-4 py-12 max-w-4xl">
        <h1 className="text-4xl font-bold mb-8 text-[#10C23F]">Termeni și Condiții – www.standupovka.live</h1>
        
        <div className="space-y-8 text-[#CCCCCC] leading-relaxed">
          <p className="text-lg">
            Prezenții Termeni și Condiții de utilizare a platformei online www.standupovka.live sunt aplicabile accesării și achiziționării biletelor pentru vizionarea concertelor transmise în direct de compania SRL "STANDUPER LOL" prin intermediul site-ului.
            Pentru folosirea în bune condiții a site-ului, vă recomandăm familiarizarea cu atenție a Termenilor și Condițiilor prezentate. Ne rezervăm dreptul de a face modificări ale acestor prevederi, fără o notificare prealabilă.
          </p>

          <section>
            <h2 className="text-2xl font-semibold mb-4 text-[#F2F2F2]">1. DISPOZIȚII GENERALE</h2>
            <p>
              Acest site este deținut de SRL "STANDUPER LOL". La înregistrarea comenzii de bilete pentru acces la stream, Cumpărătorul acceptă Termenii și Condițiile de prestare a serviciilor care sunt bazați pe legislația Republicii Moldova (în continuare – Termeni și Condiții).
            </p>
            <p className="mt-4">
              Utilizarea website-ului presupune acceptarea Termenilor și Condițiilor propuse de către SRL "STANDUPER LOL", în conformitate cu Legea nr.284/2004 privind Comerțul Electronic. Relațiile dintre client și prestator sunt stabilite în baza Legii nr.105/2003 cu privire la Protecția drepturilor consumatorului și a altor acte normative aplicabile.
            </p>
            <p className="mt-4">
              Prestatorul își rezervă dreptul de a modifica Termenii și Condițiile, iar Cumpărătorul este obligat să monitorizeze modificările.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4 text-[#F2F2F2]">2. PROTECȚIA DATELOR CU CARACTER PERSONAL</h2>
            <p>
              Prin utilizarea site-ului www.standupovka.live, sunteți de acord în mod automat cu colectarea și prelucrarea datelor cu caracter personal, necesare pentru procesarea comenzilor, confirmarea și acordarea accesului la stream.
            </p>
            <p className="mt-4">
              Datele personale sunt prelucrate doar în scopuri legitime – furnizarea accesului la concertele live, promoții, analize statistice, cookies și trimiterea notificărilor/newsletter.
            </p>
            <p className="mt-4">
              Informațiile cu caracter personal sunt stocate doar pentru perioada necesară și în conformitate cu Legea nr.133/2011 privind protecția datelor cu caracter personal.
            </p>
            <p className="mt-4">
              Noi folosim măsuri de securitate comerciale pentru protecția datelor, dar transmiterea pe internet nu poate fi garantată 100%. Cumpărătorul își asumă responsabilitatea pentru furnizarea datelor.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4 text-[#F2F2F2]">3. ÎNREGISTRAREA ȘI ACHITAREA BILETELOR</h2>
            <p>
              Achitarea comenzilor este posibilă exclusiv cu cardul de plată. După efectuarea plății, Cumpărătorul va primi pe email confirmarea și datele de acces pentru vizionarea stream-ului.
            </p>
            <p className="mt-4">
              Plata online se face în condiții de siguranță maximă folosind cardurile bancare care permit tranzacții online. Procesatorul de plăți utilizează standardul de securitate 3D-Secure.
            </p>
            <p className="mt-4">
              Rambursarea mijloacelor bănești se efectuează doar pe cardul de plată care a fost utilizat pentru achiziție.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4 text-[#F2F2F2]">4. ACCESUL LA STREAM</h2>
            <p>
              După confirmarea plății, Cumpărătorul primește un link unic sau date de acces pentru vizionarea concertului live.
            </p>
            <p className="mt-4">
              Accesul este valabil doar pentru perioada evenimentului, conform programului afișat pe site. După încheierea concertului, linkul nu mai este funcțional.
            </p>
            <p className="mt-4">
              Datele de acces nu trebuie transmise către alte persoane. SRL "STANDUPER LOL" își rezervă dreptul de a bloca accesul în cazul detectării utilizării abuzive.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4 text-[#F2F2F2]">5. DREPTUL LA RETUR</h2>
            <p>
              Conform Legii nr.105-XV/2003 privind protecția consumatorilor, biletele achiziționate pentru evenimente cu dată fixă (streamuri live) nu pot fi returnate sau rambursate, decât în cazul anulării evenimentului de către organizator.
            </p>
            <p className="mt-4">
              În cazul anulării concertului, mijloacele bănești vor fi returnate integral pe cardul utilizat la achiziție.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4 text-[#F2F2F2]">6. POLITICA DE CONFIDENȚIALITATE</h2>
            <p>
              În conformitate cu Legea nr.133/2011 privind protecția datelor cu caracter personal, colectăm doar datele necesare: nume, prenume, adresă de email și număr de telefon.
            </p>
            <p className="mt-4">
              Aceste date sunt utilizate exclusiv pentru procesarea comenzilor, acordarea accesului la stream și informarea consumatorului. Datele nu vor fi comercializate sau divulgate terților, cu excepția cazurilor prevăzute de lege.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4 text-[#F2F2F2]">7. DATELE DE CONTACT</h2>
            <div className="bg-[#1A1A1A] p-6 rounded-lg border border-[#333333]">
              <p><strong>Denumirea juridică a companiei:</strong> SRL "STANDUPER LOL"</p>
              <p className="mt-2"><strong>IDNO:</strong> 1022600022959</p>
              <p className="mt-2"><strong>Adresa juridică:</strong> str. Prof. Ion Dumeniuc 24, ap. 70, șos. Hîncești 61, Chișinău, Republica Moldova</p>
              <p className="mt-2"><strong>Adresa Fizica:</strong> șos. Hîncești 61</p>
              <p className="mt-2"><strong>Telefon de contact:</strong> +373 608 58551</p>
              <p className="mt-2"><strong>Email de contact:</strong> standupovka@gmail.com</p>
            </div>
          </section>
        </div>
      </div>
    </div>
  )
}