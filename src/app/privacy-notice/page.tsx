import GuestHeader from "@/components/GuestHeader";
import GuestFooter from "@/components/GuestFooter";
// import { useState } from "react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Paunawa sa Privacy | E-KWENTO",
  description: "Pabatid para sa mga guro upang pamahalaan ang kanilang mga kwento at estudyante",
};

export default function PrivacyNotice() {
  // const [language, setLanguage] = useState<'en' | 'tl'>('tl');
  const language = 'tl' as 'en' | 'tl'; // Default to Tagalog

  return (
    <div className="flex flex-col min-h-screen">
      <GuestHeader />
      <div className="relative flex flex-col min-h-screen bg-white">
        {/* Background Image with Overlay */}
        <div className="absolute inset-0 z-0">
          {/* Background image goes to the back */}
          <div
            className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-30 z-0"
            style={{ backgroundImage: 'url("/images/blue-bg.webp")' }}
          ></div>

          {/* White overlay in front of the image */}
          <div className="absolute inset-0 bg-[#1E40AF] opacity-20 z-10"></div>
        </div>

        {/* Main Content */}
        <main className="flex-grow relative z-10 py-12 px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg p-8">
            <div className="text-center mb-8">
              {/* <div className="flex justify-center mb-4">
                <div className="bg-white/80 rounded-lg p-2 shadow-sm border border-gray-200">
                  <div className="flex space-x-2">
                    <button
                      onClick={() => setLanguage('tl')}
                      className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${language === 'tl'
                        ? 'bg-[#1E3A8A] text-white'
                        : 'text-[#1E3A8A] hover:bg-blue-50'
                        }`}
                    >
                      Tagalog
                    </button>
                    <button
                      onClick={() => setLanguage('en')}
                      className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${language === 'en'
                        ? 'bg-[#1E3A8A] text-white'
                        : 'text-[#1E3A8A] hover:bg-blue-50'
                        }`}
                    >
                      English
                    </button>
                  </div>
                </div>
              </div> */}
              <h1 className="text-3xl font-bold text-[#1E3A8A]">
                {language === 'en' ? 'Data Privacy Notice for Student Users' : 'Pabatid sa Privacy ng Datos para sa mga Mag-aaral'}
              </h1>
              <p className="text-gray-600 mt-2">
                {language === 'en' ? 'Effective Date: August 2025' : 'Petsa ng Pagkakatupad: Agosto 2025'}
              </p>
            </div>

            <div className="prose prose-blue max-w-none">
              <div className="bg-blue-50 border border-[#1E3A8A] rounded-lg p-6 mb-8">
                <h3 className="text-[#1E3A8A] font-bold text-lg mb-3">
                  {language === 'en'
                    ? 'IMPORTANT NOTICE FOR PARENTS/GUARDIANS'
                    : 'MAHALAGANG PAALALA PARA SA MGA MAGULANG/TAGAPAG-ALAGA'
                  }
                </h3>
                <p className="text-gray-700 leading-relaxed">
                  {language === 'en'
                    ? 'This educational system is designed for Grade 10 students who are minors under Philippine law. As required by the Data Privacy Act of 2012, parental or guardian consent is mandatory before any student data can be collected or processed.'
                    : 'Ang sistemang pang-edukasyong ito ay ginawa para sa mga mag-aaral sa Grade 10 na menor de edad sa ilalim ng batas ng Pilipinas. Ayon sa Data Privacy Act ng 2012, kinakailangan ang pahintulot ng magulang o tagapag-alaga bago makakuha o maproseso ang anumang datos ng mag-aaral.'
                  }
                </p>
              </div>

              <p className="text-gray-700 mb-6">
                {language === 'en'
                  ? "We value and respect your child's privacy. In compliance with the Data Privacy Act of 2012 (Republic Act No. 10173), we are committed to ensuring that your child's personal data is collected, processed, and stored securely and used solely for lawful and legitimate educational purposes. Since our users are minors, we require explicit consent from parents or legal guardians before any data collection begins."
                  : 'Pinahahalagahan at ginagalang namin ang privacy ng inyong anak. Sa pagsunod sa Data Privacy Act ng 2012 (Republic Act No. 10173), nakatuon kami sa pagsisiguro na ang personal na datos ng inyong anak ay kinokolekta, pinoproseso, at nakaimbak nang ligtas at ginagamit lamang para sa legal at lehitimong layuning pang-edukasyon. Dahil ang aming mga gumagamit ay menor de edad, kinakailangan namin ang tahasang pahintulot ng mga magulang o tagapag-alaga bago magsimula ang anumang pagkolekta ng datos.'
                }
              </p>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-[#1E3A8A] mb-4">
                  {language === 'en' ? '1. Student Data to be Collected' : '1. Mga Datos ng Mag-aaral na Kokolektahin'}
                </h2>
                <p className="text-gray-700 mb-4">
                  {language === 'en'
                    ? 'The following data will be collected from your child upon their use of the E-KWENTO educational system:'
                    : 'Ang sumusunod na datos ay kokolektahin mula sa inyong anak sa kanilang paggamit ng E-KWENTO educational system:'
                  }
                </p>
                <ul className="list-disc list-inside space-y-2 text-gray-700">
                  {language === 'en' ? (
                    <>
                      <li>Student&apos;s full name</li>
                      <li>Student&apos;s section/class assignment</li>
                      <li>Student&apos;s responses and answers to module-based quizzes and educational activities</li>
                      <li>Records of parental/guardian consent to this Data Privacy Notice</li>
                      <li>Learning progress and performance data</li>
                    </>
                  ) : (
                    <>
                      <li>Buong pangalan ng mag-aaral</li>
                      <li>Seksyon/klase ng mag-aaral</li>
                      <li>Mga sagot at tugon ng mag-aaral sa mga module-based na pagsusulit at gawain sa pag-aaral</li>
                      <li>Mga rekord ng pahintulot ng magulang/tagapag-alaga sa Pabatid sa Privacy ng Datos na ito</li>
                      <li>Datos ng pag-unlad at pagganap sa pag-aaral</li>
                    </>
                  )}
                </ul>
                <div className="text-gray-700 mt-4 bg-blue-50 border border-blue-200 p-4 rounded-lg">
                  <strong className="text-[#1E3A8A]">
                    {language === 'en' ? 'Note:' : 'Tandaan:'}
                  </strong>
                  <span className="text-gray-700">
                    {language === 'en'
                      ? ' No sensitive personal information such as contact details, addresses, or financial information will be collected through this system.'
                      : ' Walang sensitibong personal na impormasyon tulad ng mga detalye sa pakikipag-ugnayan, mga address, o impormasyon sa pananalapi ang kokohinin sa pamamagitan ng sistemang ito.'
                    }
                  </span>
                </div>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-[#1E3A8A] mb-4">
                  {language === 'en' ? '2. Purpose of Data Collection' : '2. Layunin ng Pagkolekta ng Datos'}
                </h2>
                <p className="text-gray-700 mb-4">
                  {language === 'en'
                    ? "Your child's data will be used exclusively for the following educational purposes:"
                    : 'Ang datos ng inyong anak ay gagamitin lamang para sa sumusunod na layuning pang-edukasyon:'
                  }
                </p>
                <ul className="list-disc list-inside space-y-2 text-gray-700">
                  {language === 'en' ? (
                    <>
                      <li>To track and monitor your child&apos;s learning progress and academic performance</li>
                      <li>To enable teachers to review, evaluate, and provide feedback on student responses</li>
                      <li>To store quiz results and maintain academic records for educational assessment</li>
                      <li>To improve learning materials, teaching methods, and system functionality</li>
                      <li>To generate progress reports for parents and teachers</li>
                    </>
                  ) : (
                    <>
                      <li>Upang subaybayan at bantayan ang pag-unlad at pagganap sa pag-aaral ng inyong anak</li>
                      <li>Upang bigyang-daan ang mga guro na suriin, tukuyin, at magbigay ng feedback sa mga tugon ng mag-aaral</li>
                      <li>Upang mag-imbak ng mga resulta ng pagsusulit at panatilihin ang mga rekord sa akademya para sa pagsusuri sa edukasyon</li>
                      <li>Upang mapabuti ang mga materyales sa pag-aaral, mga pamamaraan sa pagtuturo, at functionality ng sistema</li>
                      <li>Upang makagawa ng mga ulat sa pag-unlad para sa mga magulang at guro</li>
                    </>
                  )}
                </ul>
                <p className="text-gray-700 mt-4 font-semibold">
                  {language === 'en'
                    ? 'Data will NOT be used for any commercial purposes or shared with third parties outside the educational institution.'
                    : 'HINDI gagamitin ang datos para sa anumang komersyal na layunin o ibabahagi sa mga third party sa labas ng institusyong pang-edukasyon.'
                  }
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-[#1E3A8A] mb-4">
                  {language === 'en' ? '3. Data Storage, Security, and Access' : '3. Pag-iimbak, Seguridad, at Pag-access ng Datos'}
                </h2>
                <p className="text-gray-700 mb-4">
                  {language === 'en'
                    ? "Your child's personal data will be:"
                    : 'Ang personal na datos ng inyong anak ay:'
                  }
                </p>
                <ul className="list-disc list-inside space-y-2 text-gray-700">
                  {language === 'en' ? (
                    <>
                      <li>Stored in a secure, encrypted database with industry-standard security measures</li>
                      <li>Accessed only by authorized school personnel, including teachers, administrators, and IT support staff</li>
                      <li>Protected by strict access controls and user authentication systems</li>
                      <li>Not shared with any external third parties or used for commercial purposes</li>
                      <li>Retained only for the duration necessary for educational purposes</li>
                    </>
                  ) : (
                    <>
                      <li>Iiimbak sa secure, encrypted na database na may industry-standard na mga hakbang sa seguridad</li>
                      <li>Maa-access lamang ng mga awtorisadong personnel ng paaralan, kasama ang mga guro, administrator, at IT support staff</li>
                      <li>Protektado ng mahigpit na access controls at user authentication systems</li>
                      <li>Hindi ibabahagi sa anumang panlabas na third parties o gagamitin para sa mga komersyyal na layunin</li>
                      <li>Papanatilihin lamang sa loob ng panahong kinakailangan para sa mga layuning pang-edukasyon</li>
                    </>
                  )}
                </ul>
                <p className="text-gray-700 mt-4">
                  {language === 'en'
                    ? 'We implement comprehensive technical, physical, and organizational security measures to protect student data against unauthorized access, loss, alteration, or misuse. Regular security audits and updates are conducted to maintain the highest level of data protection.'
                    : 'Ipinapatupad namin ang komprehensibong mga hakbang sa seguridad na teknikal, pisikal, at organisasyonal upang protektahan ang datos ng mga mag-aaral laban sa hindi awtorisadong pag-access, pagkawala, pagbabago, o maling paggamit. Ginagawa ang mga regular na audit sa seguridad at mga update upang mapanatili ang pinakamataas na antas ng proteksyon ng datos.'
                  }
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-[#1E3A8A] mb-4">
                  {language === 'en' ? '4. Parental/Guardian Rights' : '4. Mga Karapatan ng Magulang/Tagapag-alaga'}
                </h2>
                <p className="text-gray-700 mb-4">
                  {language === 'en'
                    ? 'As the parent or legal guardian of a minor student, you have the following rights under the Data Privacy Act of 2012:'
                    : 'Bilang magulang o legal na tagapag-alaga ng isang menor de edad na mag-aaral, mayroon kayong sumusunod na mga karapatan sa ilalim ng Data Privacy Act ng 2012:'
                  }
                </p>
                <ul className="list-disc list-inside space-y-2 text-gray-700">
                  {language === 'en' ? (
                    <>
                      <li>To be informed about how your child&apos;s data is collected, used, and stored</li>
                      <li>To access your child&apos;s personal information and learning records upon written request</li>
                      <li>To request correction of any inaccurate or incomplete data about your child</li>
                      <li>To object to the processing of your child&apos;s data for legitimate reasons</li>
                      <li>To withdraw consent at any time, subject to educational and legal considerations</li>
                      <li>To file a complaint with the National Privacy Commission if you believe your rights have been violated</li>
                    </>
                  ) : (
                    <>
                      <li>Na malaman kung paano kinokolekta, ginagamit, at iinimbak ang datos ng inyong anak</li>
                      <li>Na ma-access ang personal na impormasyon at mga rekord sa pag-aaral ng inyong anak sa pamamagitan ng nakasulat na kahilingan</li>
                      <li>Na humingi ng pagwawasto ng anumang hindi tumpak o hindi kumpletong datos tungkol sa inyong anak</li>
                      <li>Na tumutol sa pagproseso ng datos ng inyong anak kung may lehitimong dahilan</li>
                      <li>Na bawiin ang pahintulot anumang oras, alinsunod sa mga konsiderasyon sa edukasyon at legal</li>
                      <li>Na maghain ng reklamo sa National Privacy Commission kung naniniwala kayong nalabag ang inyong mga karapatan</li>
                    </>
                  )}
                </ul>
                <div className="text-gray-700 mt-4 bg-blue-50 border border-blue-200 p-4 rounded-lg">
                  <strong className="text-[#1E3A8A]">
                    {language === 'en' ? 'Note:' : 'Tandaan:'}
                  </strong>
                  <span className="text-gray-700">
                    {language === 'en'
                      ? " Withdrawal of consent may affect your child's ability to participate in certain educational activities that require data processing."
                      : ' Ang pagbawi ng pahintulot ay maaaring makaapekto sa kakayahan ng inyong anak na lumahok sa ilang mga gawain sa edukasyon na nangangailangan ng pagproseso ng datos.'
                    }
                  </span>
                </div>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-[#1E3A8A] mb-4">
                  {language === 'en' ? '5. Parental Consent Requirements' : '5. Mga Kinakailangan sa Pahintulot ng Magulang'}
                </h2>
                <div className="bg-blue-50 border border-blue-200 p-6 rounded-lg mb-6">
                  <h4 className="text-[#1E3A8A] font-bold text-base mb-3">
                    {language === 'en' ? 'Physical Parental Consent Form' : 'Pisikal na Form ng Pahintulot ng Magulang'}
                  </h4>
                  <p className="text-gray-700 leading-relaxed">
                    {language === 'en'
                      ? "In addition to this digital notice, a physical parental consent form will be provided by the school for you to sign and return. This form serves as official documentation of your consent for the collection and processing of your child's data as outlined in this notice."
                      : 'Bilang karagdagan sa digital na pabatid na ito, magbibigay ang paaralan ng pisikal na form ng pahintulot ng magulang para sa inyong pagpirma at pagbabalik. Ang form na ito ay nagsisilbi bilang opisyal na dokumentasyon ng inyong pahintulot para sa pagkolekta at pagproseso ng datos ng inyong anak ayon sa nakasaad sa pabatid na ito.'
                    }
                  </p>
                </div>
                <p className="text-gray-700 mb-4">
                  {language === 'en'
                    ? 'By providing your consent, you confirm that:'
                    : 'Sa pagbibigay ng inyong pahintulot, kumpirma ninyo na:'
                  }
                </p>
                <ul className="list-disc list-inside space-y-2 text-gray-700">
                  {language === 'en' ? (
                    <>
                      <li>You have read and understood this Data Privacy Notice in its entirety</li>
                      <li>You voluntarily give your consent as the parent/legal guardian for the collection and processing of your child&apos;s personal data</li>
                      <li>You understand that this consent is required before your child can participate in the E-KWENTO educational system</li>
                      <li>You acknowledge that both digital and physical consent forms must be completed</li>
                      <li>You understand that you may withdraw this consent at any time by contacting the school administration</li>
                    </>
                  ) : (
                    <>
                      <li>Nabasa at naunawaan ninyo ang Pabatid sa Privacy ng Datos na ito nang buo</li>
                      <li>Kusang loob ninyong binibigay ang inyong pahintulot bilang magulang/legal na tagapag-alaga para sa pagkolekta at pagproseso ng personal na datos ng inyong anak</li>
                      <li>Nauunawaan ninyo na kinakailangan ang pahintulot na ito bago makalahok ang inyong anak sa E-KWENTO educational system</li>
                      <li>Kinikilala ninyo na dapat makumpleto ang parehong digital at pisikal na mga form ng pahintulot</li>
                      <li>Nauunawaan ninyo na maaari ninyong bawiin ang pahintulot na ito anumang oras sa pamamagitan ng pakikipag-ugnayan sa administrasyon ng paaralan</li>
                    </>
                  )}
                </ul>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-[#1E3A8A] mb-4">
                  {language === 'en' ? '6. Data Retention and Disposal' : '6. Pag-retain at Pagtatapon ng Datos'}
                </h2>
                <p className="text-gray-700 mb-4">
                  {language === 'en'
                    ? 'Student data will be retained according to the following guidelines:'
                    : 'Ang datos ng mga mag-aaral ay papanatilihin ayon sa sumusunod na mga alituntunin:'
                  }
                </p>
                <ul className="list-disc list-inside space-y-2 text-gray-700">
                  {language === 'en' ? (
                    <>
                      <li>Academic records and quiz results will be retained for the duration of the academic year</li>
                      <li>Data may be retained for up to one additional year for academic continuity purposes</li>
                      <li>Upon graduation or transfer, data will be securely archived according to school policies</li>
                      <li>All data will be securely disposed of using industry-standard data destruction methods when no longer needed</li>
                      <li>Parents may request earlier deletion of their child&apos;s data, subject to academic and legal requirements</li>
                    </>
                  ) : (
                    <>
                      <li>Ang mga rekord sa akademya at mga resulta ng pagsusulit ay papanatilihin sa loob ng academic year</li>
                      <li>Maaaring panatilihin ang datos hanggang sa isang karagdagang taon para sa mga layunin ng pagpapatuloy sa akademya</li>
                      <li>Sa pagtatapos o paglipat, ang datos ay ligtas na ia-archive ayon sa mga patakaran ng paaralan</li>
                      <li>Lahat ng datos ay ligtas na itatapon gamit ang industry-standard na mga pamamaraan ng pagwawasak ng datos kapag hindi na kailangan</li>
                      <li>Maaaring hilingin ng mga magulang ang mas maagang pagbura ng datos ng kanilang anak, alinsunod sa mga kinakailangan sa akademya at legal</li>
                    </>
                  )}
                </ul>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-[#1E3A8A] mb-4">
                  {language === 'en' ? 'Contact Information' : 'Impormasyon sa Pakikipag-ugnayan'}
                </h2>
                <p className="text-gray-700 mb-4">
                  {language === 'en'
                    ? "For any questions, concerns, or requests regarding your child's data privacy, please contact our Data Protection Officer:"
                    : 'Para sa anumang mga tanong, alalahanin, o mga kahilingan tungkol sa privacy ng datos ng inyong anak, mangyaring makipag-ugnayan sa aming Data Protection Officer:'
                  }
                </p>
                <div className="mt-4 space-y-3 text-gray-700 bg-blue-50 border border-blue-200 p-6 rounded-lg">
                  <p className="font-semibold text-[#1E3A8A] text-lg">Data Protection Officer</p>
                  <div className="space-y-2">
                    <p><span className="font-medium">Email:</span> valerieannesangalang14@gmail.com</p>
                    <p>
                      <span className="font-medium">
                        {language === 'en' ? 'Contact Number:' : 'Contact Number:'}
                      </span> (02) XXX-XXXX
                    </p>
                    <p>
                      <span className="font-medium">
                        {language === 'en' ? 'Office Address:' : 'Office Address:'}
                      </span> Bestlink College of the Philippines
                    </p>
                    <p className="text-sm mt-4 text-gray-600 border-t border-blue-200 pt-3">
                      <span className="font-medium text-[#1E3A8A]">
                        {language === 'en' ? 'Office Hours:' : 'Mga Oras ng Opisina:'}
                      </span>
                      {language === 'en' ? ' Monday to Friday, 8:00 AM - 5:00 PM' : ' Lunes hanggang Biyernes, 8:00 AM - 5:00 PM'}
                    </p>
                  </div>
                </div>
                <p className="text-gray-700 mt-4 text-sm">
                  {language === 'en'
                    ? 'You may also file complaints directly with the National Privacy Commission at '
                    : 'Maaari din kayong direktang maghain ng mga reklamo sa National Privacy Commission sa '
                  }
                  <strong> privacy@privacy.gov.ph</strong>
                  {language === 'en'
                    ? ' or visit their website at '
                    : ' o bisitahin ang kanilang website sa '
                  }
                  <strong>privacy.gov.ph</strong>.
                </p>
              </section>
            </div>
          </div>
        </main>
      </div>
      <GuestFooter />
    </div>
  );
}