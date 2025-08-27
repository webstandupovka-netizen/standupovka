import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Politica de Confidențialitate | Standupovka',
  description: 'Politica de confidențialitate pentru platforma Standupovka - cum colectăm, folosim și protejăm datele dumneavoastră personale.',
}

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-[#0A0A0A] text-[#F2F2F2]">
      <div className="container mx-auto px-4 py-12 max-w-4xl">
        <h1 className="text-4xl font-bold mb-8 text-[#10C23F]">Politica de Confidențialitate</h1>
        
        <div className="space-y-8 text-[#CCCCCC] leading-relaxed">
          <section>
            <h2 className="text-2xl font-semibold mb-4 text-[#F2F2F2]">1. Informații Generale</h2>
            <p>
              Această Politică de Confidențialitate descrie modul în care Standupovka ("noi", "compania noastră") 
              colectează, utilizează și protejează informațiile dumneavoastră personale atunci când utilizați 
              platforma noastră de streaming pentru spectacole de stand-up comedy.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4 text-[#F2F2F2]">2. Informații pe care le Colectăm</h2>
            <div className="space-y-4">
              <div>
                <h3 className="text-xl font-medium mb-2 text-[#10C23F]">2.1 Informații de Cont</h3>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>Adresa de email (pentru autentificare)</li>
                  <li>Informații despre dispozitiv și browser</li>
                  <li>Adresa IP și locația geografică aproximativă</li>
                </ul>
              </div>
              
              <div>
                <h3 className="text-xl font-medium mb-2 text-[#10C23F]">2.2 Informații de Plată</h3>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>Detalii despre tranzacții (procesate securizat prin MAIB)</li>
                  <li>Istoricul achizițiilor</li>
                  <li>Informații despre rambursări</li>
                </ul>
              </div>

              <div>
                <h3 className="text-xl font-medium mb-2 text-[#10C23F]">2.3 Informații de Utilizare</h3>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>Timpul petrecut pe platformă</li>
                  <li>Spectacolele vizionate</li>
                  <li>Preferințele de vizionare</li>
                  <li>Loguri de activitate</li>
                </ul>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4 text-[#F2F2F2]">3. Cum Utilizăm Informațiile</h2>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>Pentru a vă oferi acces la spectacolele achiziționate</li>
              <li>Pentru a procesa plățile și a gestiona contul dumneavoastră</li>
              <li>Pentru a îmbunătăți experiența utilizatorului</li>
              <li>Pentru a preveni frauda și a asigura securitatea platformei</li>
              <li>Pentru a vă trimite notificări importante despre serviciu</li>
              <li>Pentru a respecta obligațiile legale</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4 text-[#F2F2F2]">4. Partajarea Informațiilor</h2>
            <p className="mb-4">
              Nu vindem, nu închiriem și nu partajăm informațiile dumneavoastră personale cu terți, 
              cu excepția următoarelor situații:
            </p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>Cu procesatorii de plăți (MAIB) pentru tranzacții</li>
              <li>Cu furnizorii de servicii tehnice pentru mentenanța platformei</li>
              <li>Când este necesar din punct de vedere legal</li>
              <li>Cu consimțământul dumneavoastră explicit</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4 text-[#F2F2F2]">5. Securitatea Datelor</h2>
            <p>
              Implementăm măsuri de securitate tehnice și organizatorice pentru a proteja 
              informațiile dumneavoastră împotriva accesului neautorizat, modificării, 
              divulgării sau distrugerii. Toate datele sunt criptate în tranzit și în repaus.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4 text-[#F2F2F2]">6. Drepturile Dumneavoastră</h2>
            <p className="mb-4">Aveți următoarele drepturi în ceea ce privește datele personale:</p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>Dreptul de acces la datele personale</li>
              <li>Dreptul de rectificare a datelor inexacte</li>
              <li>Dreptul de ștergere a datelor ("dreptul de a fi uitat")</li>
              <li>Dreptul de restricționare a prelucrării</li>
              <li>Dreptul la portabilitatea datelor</li>
              <li>Dreptul de opoziție la prelucrare</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4 text-[#F2F2F2]">7. Cookies și Tehnologii Similare</h2>
            <p>
              Utilizăm cookies și tehnologii similare pentru a îmbunătăți funcționalitatea 
              platformei, a analiza traficul și a personaliza experiența dumneavoastră. 
              Puteți controla setările pentru cookies prin browserul dumneavoastră.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4 text-[#F2F2F2]">8. Reținerea Datelor</h2>
            <p>
              Păstrăm datele dumneavoastră personale doar atât timp cât este necesar pentru 
              îndeplinirea scopurilor pentru care au fost colectate sau conform cerințelor legale.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4 text-[#F2F2F2]">9. Modificări ale Politicii</h2>
            <p>
              Ne rezervăm dreptul de a actualiza această Politică de Confidențialitate. 
              Vă vom notifica despre modificările importante prin email sau prin afișarea 
              unei notificări pe platformă.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4 text-[#F2F2F2]">10. Contact</h2>
            <p>
              Pentru întrebări despre această Politică de Confidențialitate sau pentru 
              exercitarea drepturilor dumneavoastră, ne puteți contacta la:
            </p>
            <div className="mt-4 p-4 bg-[#1A1A1A] rounded-lg border border-[#333333]">
              <p><strong>Email:</strong> privacy@standupovka.md</p>
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