import GuestHeader from "@/components/GuestHeader";
import GuestFooter from "@/components/GuestFooter";
import Link from "next/link";
import { Metadata } from "next";

export const metadata: Metadata = {
    title: 'Patakaran sa Privacy | E-KWENTO',
    description: 'Matuto tungkol sa aming mga gawi sa privacy',
}

export default function PrivacyNoticeTagalog() {
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
                            <div className="flex justify-center mb-4">
                                <div className="bg-white/80 rounded-lg p-2 shadow-sm border border-gray-200">
                                    <div className="flex space-x-2">
                                        <Link 
                                            href="/privacy-statement" 
                                            className="text-[#1E3A8A] px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-50 transition-colors"
                                        >
                                            English
                                        </Link>
                                        <span className="bg-[#1E3A8A] text-white px-4 py-2 rounded-md text-sm font-medium">
                                            Tagalog
                                        </span>
                                    </div>
                                </div>
                            </div>
                            <h1 className="text-3xl font-bold text-[#1E3A8A]">Pabatid sa Privacy ng Datos para sa mga Mag-aaral</h1>
                            <p className="text-gray-600 mt-2">Petsa ng Pagkakatupad: Agosto 2025</p>
                        </div>

                        <div className="prose prose-blue max-w-none">
                            <div className="bg-blue-50 border border-[#1E3A8A] rounded-lg p-6 mb-8">
                                <h3 className="text-[#1E3A8A] font-bold text-lg mb-3">
                                    MAHALAGANG PAALALA PARA SA MGA MAGULANG/TAGAPAG-ALAGA
                                </h3>
                                <p className="text-gray-700 leading-relaxed">
                                    Ang sistemang pang-edukasyong ito ay ginawa para sa mga mag-aaral sa Grade 10 na menor de edad 
                                    sa ilalim ng batas ng Pilipinas. Ayon sa Data Privacy Act ng 2012, kinakailangan ang pahintulot 
                                    ng magulang o tagapag-alaga bago makakuha o maproseso ang anumang datos ng mag-aaral.
                                </p>
                            </div>                            <p className="text-gray-700 mb-6">
                                Pinahahalagahan at ginagalang namin ang privacy ng inyong anak. Sa pagsunod sa Data Privacy Act ng 2012
                                (Republic Act No. 10173), nakatuon kami sa pagsisiguro na ang personal na datos ng inyong anak ay
                                kinokolekta, pinoproseso, at nakaimbak nang ligtas at ginagamit lamang para sa legal at lehitimong
                                layuning pang-edukasyon. Dahil ang aming mga gumagamit ay menor de edad, kinakailangan namin ang
                                tahasang pahintulot ng mga magulang o tagapag-alaga bago magsimula ang anumang pagkolekta ng datos.
                            </p>

                            <section className="mb-8">
                                <h2 className="text-2xl font-semibold text-[#1E3A8A] mb-4">1. Datos ng Mag-aaral na Kokohinin</h2>
                                <p className="text-gray-700 mb-4">
                                    Ang sumusunod na datos ay kokohinin mula sa inyong anak sa kanilang paggamit ng E-KWENTO educational system:
                                </p>
                                <ul className="list-disc list-inside space-y-2 text-gray-700">
                                    <li>Buong pangalan ng mag-aaral</li>
                                    <li>Seksyon/klase ng mag-aaral</li>
                                    <li>Mga sagot at tugon ng mag-aaral sa mga module-based na pagsusulit at gawain sa pag-aaral</li>
                                    <li>Mga rekord ng pahintulot ng magulang/tagapag-alaga sa Pabatid sa Privacy ng Datos na ito</li>
                                    <li>Datos ng pag-unlad at pagganap sa pag-aaral</li>
                                </ul>
                                <p className="text-gray-700 mt-4 text-sm bg-blue-50 p-3 rounded">
                                    <strong>Tandaan:</strong> Walang sensitibong personal na impormasyon tulad ng mga detalye sa pakikipag-ugnayan,
                                    mga address, o impormasyon sa pananalapi ang kokohinin sa pamamagitan ng sistemang ito.
                                </p>
                            </section>

                            <section className="mb-8">
                                <h2 className="text-2xl font-semibold text-[#1E3A8A] mb-4">2. Layunin ng Pagkolekta ng Datos</h2>
                                <p className="text-gray-700 mb-4">
                                    Ang datos ng inyong anak ay gagamitin lamang para sa sumusunod na layuning pang-edukasyon:
                                </p>
                                <ul className="list-disc list-inside space-y-2 text-gray-700">
                                    <li>Upang subaybayan at bantayan ang pag-unlad at pagganap sa pag-aaral ng inyong anak</li>
                                    <li>Upang bigyang-daan ang mga guro na suriin, tukuyin, at magbigay ng feedback sa mga tugon ng mag-aaral</li>
                                    <li>Upang mag-imbak ng mga resulta ng pagsusulit at panatilihin ang mga rekord sa akademya para sa pagsusuri sa edukasyon</li>
                                    <li>Upang mapabuti ang mga materyales sa pag-aaral, mga pamamaraan sa pagtuturo, at functionality ng sistema</li>
                                    <li>Upang makagawa ng mga ulat sa pag-unlad para sa mga magulang at guro</li>
                                </ul>
                                <p className="text-gray-700 mt-4 font-semibold">
                                    HINDI gagamitin ang datos para sa anumang komersyyal na layunin o ibabahagi sa mga third party
                                    sa labas ng institusyong pang-edukasyon.
                                </p>
                            </section>

                            <section className="mb-8">
                                <h2 className="text-2xl font-semibold text-[#1E3A8A] mb-4">3. Pag-iimbak, Seguridad, at Pag-access ng Datos</h2>
                                <p className="text-gray-700 mb-4">
                                    Ang personal na datos ng inyong anak ay:
                                </p>
                                <ul className="list-disc list-inside space-y-2 text-gray-700">
                                    <li>Iimbakin sa secure, encrypted na database na may industry-standard na mga hakbang sa seguridad</li>
                                    <li>Maa-access lamang ng mga awtorisadong personnel ng paaralan, kasama ang mga guro, administrator, at IT support staff</li>
                                    <li>Protektado ng mahigpit na access controls at user authentication systems</li>
                                    <li>Hindi ibabahagi sa anumang panlabas na third parties o gagamitin para sa mga komersyyal na layunin</li>
                                    <li>Papanatilihin lamang sa loob ng panahong kinakailangan para sa mga layuning pang-edukasyon</li>
                                </ul>
                                <p className="text-gray-700 mt-4">
                                    Ipinapatupad namin ang komprehensibong mga hakbang sa seguridad na teknikal, pisikal, at organisasyonal
                                    upang protektahan ang datos ng mga mag-aaral laban sa hindi awtorisadong pag-access, pagkawala,
                                    pagbabago, o maling paggamit. Ginagawa ang mga regular na audit sa seguridad at mga update
                                    upang mapanatili ang pinakamataas na antas ng proteksyon ng datos.
                                </p>
                            </section>

                            <section className="mb-8">
                                <h2 className="text-2xl font-semibold text-[#1E3A8A] mb-4">4. Mga Karapatan ng Magulang/Tagapag-alaga</h2>
                                <p className="text-gray-700 mb-4">
                                    Bilang magulang o legal na tagapag-alaga ng isang menor de edad na mag-aaral, mayroon kayong
                                    sumusunod na mga karapatan sa ilalim ng Data Privacy Act ng 2012:
                                </p>
                                <ul className="list-disc list-inside space-y-2 text-gray-700">
                                    <li>Na malaman kung paano kinokolekta, ginagamit, at iinimbak ang datos ng inyong anak</li>
                                    <li>Na ma-access ang personal na impormasyon at mga rekord sa pag-aaral ng inyong anak sa pamamagitan ng nakasulat na kahilingan</li>
                                    <li>Na humingi ng pagwawasto ng anumang hindi tumpak o hindi kumpletong datos tungkol sa inyong anak</li>
                                    <li>Na tumuol sa pagproseso ng datos ng inyong anak para sa mga lehitimong dahilan</li>
                                    <li>Na bawiin ang pahintulot anumang oras, alinsunod sa mga konsiderasyon sa edukasyon at legal</li>
                                    <li>Na maghain ng reklamo sa National Privacy Commission kung naniniwala kayong nalabag ang inyong mga karapatan</li>
                                </ul>
                                <p className="text-gray-700 mt-4 text-sm bg-blue-50 p-3 rounded">
                                    <strong>Tandaan:</strong> Ang pagbawi ng pahintulot ay maaaring makaapekto sa kakayahan ng inyong anak
                                    na lumahok sa ilang mga gawain sa edukasyon na nangangailangan ng pagproseso ng datos.
                                </p>
                            </section>

                            <section className="mb-8">
                                <h2 className="text-2xl font-semibold text-[#1E3A8A] mb-4">5. Mga Kinakailangan sa Pahintulot ng Magulang</h2>
                                <div className="bg-green-50 border border-green-200 p-4 rounded-lg mb-4">
                                    <p className="text-green-800 font-semibold mb-2">Pisikal na Form ng Pahintulot ng Magulang</p>
                                    <p className="text-green-700 text-sm">
                                        Bilang karagdagan sa digital na pabatid na ito, magbibigay ang paaralan ng pisikal na form ng
                                        pahintulot ng magulang para sa inyong pagpirma at pagbabalik. Ang form na ito ay nagsisilbi
                                        bilang opisyal na dokumentasyon ng inyong pahintulot para sa pagkolekta at pagproseso ng
                                        datos ng inyong anak ayon sa nakasaad sa pabatid na ito.
                                    </p>
                                </div>
                                <p className="text-gray-700 mb-4">
                                    Sa pagbibigay ng inyong pahintulot, kumpirma ninyo na:
                                </p>
                                <ul className="list-disc list-inside space-y-2 text-gray-700">
                                    <li>Nabasa at naunawaan ninyo ang Pabatid sa Privacy ng Datos na ito nang buo</li>
                                    <li>Kusang loob ninyong binibigay ang inyong pahintulot bilang magulang/legal na tagapag-alaga para sa pagkolekta at pagproseso ng personal na datos ng inyong anak</li>
                                    <li>Nauunawaan ninyo na kinakailangan ang pahintulot na ito bago makalahok ang inyong anak sa E-KWENTO educational system</li>
                                    <li>Kinikilala ninyo na dapat makumpleto ang parehong digital at pisikal na mga form ng pahintulot</li>
                                    <li>Nauunawaan ninyo na maaari ninyong bawiin ang pahintulot na ito anumang oras sa pamamagitan ng pakikipag-ugnayan sa administrasyon ng paaralan</li>
                                </ul>
                            </section>

                            <section className="mb-8">
                                <h2 className="text-2xl font-semibold text-[#1E3A8A] mb-4">6. Pag-retain at Pagtatapon ng Datos</h2>
                                <p className="text-gray-700 mb-4">
                                    Ang datos ng mga mag-aaral ay papanatilihin ayon sa sumusunod na mga alituntunin:
                                </p>
                                <ul className="list-disc list-inside space-y-2 text-gray-700">
                                    <li>Ang mga rekord sa akademya at mga resulta ng pagsusulit ay papanatilihin sa loob ng academic year</li>
                                    <li>Maaaring panatilihin ang datos hanggang sa isang karagdagang taon para sa mga layunin ng pagpapatuloy sa akademya</li>
                                    <li>Sa pagtatapos o paglipat, ang datos ay ligtas na ia-archive ayon sa mga patakaran ng paaralan</li>
                                    <li>Lahat ng datos ay ligtas na itatapon gamit ang industry-standard na mga pamamaraan ng pagwawasak ng datos kapag hindi na kailangan</li>
                                    <li>Maaaring hilingin ng mga magulang ang mas maagang pagbura ng datos ng kanilang anak, alinsunod sa mga kinakailangan sa akademya at legal</li>
                                </ul>
                            </section>

                            <section className="mb-8">
                                <h2 className="text-2xl font-semibold text-[#1E3A8A] mb-4">Impormasyon sa Pakikipag-ugnayan</h2>
                                <p className="text-gray-700 mb-4">
                                    Para sa anumang mga tanong, alalahanin, o mga kahilingan tungkol sa privacy ng datos ng inyong anak,
                                    mangyaring makipag-ugnayan sa aming Data Protection Officer:
                                </p>
                                <div className="mt-4 space-y-2 text-gray-700 bg-gray-50 p-4 rounded-lg">
                                    <p><strong>Data Protection Officer</strong></p>
                                    <p>Email: valerieannesangalang14@gmail.com</p>
                                    <p>Contact Number: (02) XXX-XXXX</p>
                                    <p>Office Address: Bestlink College of the Philippines</p>
                                    <p className="text-sm mt-3 text-gray-600">
                                        <strong>Mga Oras ng Opisina:</strong> Lunes hanggang Biyernes, 8:00 AM - 5:00 PM
                                    </p>
                                </div>
                                <p className="text-gray-700 mt-4 text-sm">
                                    Maaari din kayong direktang maghain ng mga reklamo sa National Privacy Commission sa
                                    <strong> privacy@privacy.gov.ph</strong> o bisitahin ang kanilang website sa <strong>privacy.gov.ph</strong>.
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
