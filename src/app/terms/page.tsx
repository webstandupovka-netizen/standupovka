import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Termeni și Condiții | Standupovka',
  description: 'Termenii și condițiile de utilizare pentru platforma Standupovka - regulile și responsabilitățile pentru utilizarea serviciului nostru.',
}

export default function TermsAndConditionsPage() {
  return (
    <div className="min-h-screen bg-[#0A0A0A] text-[#F2F2F2]">
      <div className="container mx-auto px-4 py-12 max-w-4xl">
        <h1 className="text-4xl font-bold mb-8 text-[#10C23F]">Termeni și Condiții</h1>
        
        <div className="space-y-8 text-[#CCCCCC] leading-relaxed">
          <section>
            <h2 className="text-2xl font-semibold mb-4 text-[#F2F2F2]">1. Acceptarea Termenilor</h2>
            <p>
              Prin accesarea și utilizarea platformei Standupovka ("Serviciul"), acceptați să fiți 
              obligați de acești Termeni și Condiții. Dacă nu sunteți de acord cu acești termeni, 
              vă rugăm să nu utilizați Serviciul.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4 text-[#F2F2F2]">2. Descrierea Serviciului</h2>
            <p>
              Standupovka este o platformă de streaming care oferă acces la spectacole de stand-up 
              comedy în direct și înregistrate. Serviciul permite utilizatorilor să achiziționeze 
              bilete pentru spectacole și să le vizioneze online.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4 text-[#F2F2F2]">3. Înregistrarea Contului</h2>
            <div className="space-y-4">
              <div>
                <h3 className="text-xl font-medium mb-2 text-[#10C23F]">3.1 Cerințe pentru Cont</h3>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>Trebuie să aveți cel puțin 18 ani pentru a crea un cont</li>
                  <li>Trebuie să furnizați o adresă de email validă</li>
                  <li>Sunteți responsabil pentru securitatea contului dumneavoastră</li>
                </ul>
              </div>
              
              <div>
                <h3 className="text-xl font-medium mb-2 text-[#10C23F]">3.2 Responsabilități</h3>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>Să mențineți confidențialitatea informațiilor de autentificare</li>
                  <li>Să ne notificați imediat despre orice utilizare neautorizată</li>
                  <li>Să furnizați informații exacte și actualizate</li>
                </ul>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4 text-[#F2F2F2]">4. Achiziții și Plăți</h2>
            <div className="space-y-4">
              <div>
                <h3 className="text-xl font-medium mb-2 text-[#10C23F]">4.1 Procesarea Plăților</h3>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>Toate plățile sunt procesate securizat prin MAIB</li>
                  <li>Prețurile sunt afișate în MDL și includ toate taxele aplicabile</li>
                  <li>Plata trebuie finalizată înainte de începerea spectacolului</li>
                </ul>
              </div>
              
              <div>
                <h3 className="text-xl font-medium mb-2 text-[#10C23F]">4.2 Politica de Rambursare</h3>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>Rambursările sunt disponibile până cu 24 de ore înainte de spectacol</li>
                  <li>În caz de anulare din partea noastră, se oferă rambursare completă</li>
                  <li>Problemele tehnice majore pot justifica rambursări parțiale</li>
                  <li>Rambursările sunt procesate în 5-10 zile lucrătoare</li>
                </ul>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4 text-[#F2F2F2]">5. Utilizarea Serviciului</h2>
            <div className="space-y-4">
              <div>
                <h3 className="text-xl font-medium mb-2 text-[#10C23F]">5.1 Utilizare Permisă</h3>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>Vizionarea spectacolelor pentru care ați achitat</li>
                  <li>Utilizarea pe un singur dispozitiv la un moment dat</li>
                  <li>Utilizarea pentru scopuri personale, non-comerciale</li>
                </ul>
              </div>
              
              <div>
                <h3 className="text-xl font-medium mb-2 text-[#10C23F]">5.2 Utilizare Interzisă</h3>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>Înregistrarea, copierea sau redistribuirea conținutului</li>
                  <li>Partajarea contului cu alte persoane</li>
                  <li>Utilizarea pe multiple dispozitive simultan</li>
                  <li>Încercarea de a ocoli măsurile de securitate</li>
                  <li>Utilizarea pentru scopuri comerciale fără autorizație</li>
                </ul>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4 text-[#F2F2F2]">6. Proprietatea Intelectuală</h2>
            <p className="mb-4">
              Tot conținutul disponibil pe platformă, inclusiv spectacolele, logo-urile, 
              textele și designul, este protejat de drepturile de autor și alte drepturi 
              de proprietate intelectuală.
            </p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>Nu aveți dreptul să copiați, modificați sau distribuiți conținutul</li>
              <li>Licența de vizionare este limitată și non-transferabilă</li>
              <li>Încălcarea drepturilor de autor poate duce la suspendarea contului</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4 text-[#F2F2F2]">7. Disponibilitatea Serviciului</h2>
            <p className="mb-4">
              Ne străduim să menținem serviciul disponibil 24/7, dar nu putem garanta 
              o disponibilitate de 100%. Serviciul poate fi temporar indisponibil din cauza:
            </p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>Mentenanță programată</li>
              <li>Probleme tehnice neprevăzute</li>
              <li>Probleme cu furnizorii de servicii terți</li>
              <li>Forță majoră</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4 text-[#F2F2F2]">8. Limitarea Responsabilității</h2>
            <p className="mb-4">
              În măsura permisă de lege, Standupovka nu va fi responsabilă pentru:
            </p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>Daune indirecte, incidentale sau consecvente</li>
              <li>Pierderea de date sau profit</li>
              <li>Întreruperi ale serviciului</li>
              <li>Probleme cauzate de dispozitivul sau conexiunea dumneavoastră</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4 text-[#F2F2F2]">9. Suspendarea și Închiderea Contului</h2>
            <p className="mb-4">
              Ne rezervăm dreptul să suspendăm sau să închidem contul dumneavoastră în 
              următoarele situații:
            </p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>Încălcarea acestor Termeni și Condiții</li>
              <li>Activitate frauduloasă sau suspectă</li>
              <li>Utilizarea neautorizată a serviciului</li>
              <li>Solicitarea dumneavoastră de închidere a contului</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4 text-[#F2F2F2]">10. Modificări ale Termenilor</h2>
            <p>
              Ne rezervăm dreptul să modificăm acești Termeni și Condiții în orice moment. 
              Modificările vor fi comunicate prin email sau prin afișarea unei notificări 
              pe platformă. Continuarea utilizării serviciului după modificări constituie 
              acceptarea noilor termeni.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4 text-[#F2F2F2]">11. Legea Aplicabilă</h2>
            <p>
              Acești Termeni și Condiții sunt guvernați de legile Republicii Moldova. 
              Orice dispute vor fi rezolvate în instanțele competente din Chișinău, 
              Republica Moldova.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4 text-[#F2F2F2]">12. Contact</h2>
            <p>
              Pentru întrebări despre acești Termeni și Condiții, ne puteți contacta la:
            </p>
            <div className="mt-4 p-4 bg-[#1A1A1A] rounded-lg border border-[#333333]">
              <p><strong>Email:</strong>standupovkaclub@gmail.com</p>
              <p><strong>Suport:</strong>standupovkaclub@gmail.com</p>
              <p><strong>Adresa:</strong> Chișinău, Republica Moldova</p>
            </div>
          </section>

          <div className="mt-12 pt-8 border-t border-[#333333] text-sm text-[#888888]">
            <p>Ultima actualizare: {new Date().toLocaleDateString('ro-RO', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
          </div>
        </div>
      </div>
    </div>
  )
}