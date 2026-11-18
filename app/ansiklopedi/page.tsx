"use client";
import { useState } from "react";
import { tr } from "../isimler";
import { gorselYolu } from "../gorseller";

type Kategori = "Kahraman" | "Birlik" | "Büyü" | "Savunma" | "Kuşatma";

type RehberOgesi = {
  isim: string;
  tur: Kategori;
  hedef: string;
  not: string;
  ipucu: string;
};

const LISTE: RehberOgesi[] = [
  // KAHRAMANLAR (6 Kahraman)
  { isim: "Barbarian King", tur: "Kahraman", hedef: "Yer", not: "Yüksek canlı yakın dövüş tankı.", ipucu: "Dış binaları temizleyip ana orduyu merkeze yönlendirmek (funnel) için idealdir." },
  { isim: "Archer Queen", tur: "Kahraman", hedef: "Yer ve Hava", not: "Uzun menzilli yüksek tekli hedef hasarı.", ipucu: "Şifacılarla yapılan Kraliçe Yürüyüşü ile Klan Kalesini ve kritik savunmaları alır." },
  { isim: "Grand Warden", tur: "Kahraman", hedef: "Yer ve Hava", not: "Ordunun etrafına can halesi veren destek kahramanı.", ipucu: "Sonsuz Büyük Kitap (Eternal Tome) yeteneğini Belediye Binası patlamasına sakla." },
  { isim: "Royal Champion", tur: "Kahraman", hedef: "Savunmalar", not: "Duvarların üzerinden atlayıp doğrudan savunmalara koşar.", ipucu: "Ana ordu ilerlerken yan kanattan bırakılıp kalan savunmaları temizler." },
  { isim: "Minion Prince", tur: "Kahraman", hedef: "Yer ve Hava", not: "Hava saldırılarına özel yüksek hasarlı uçan kahraman.", ipucu: "Ejderha ve Balon ordularının arkasından bırakıldığında savunmaları hızla eritir." },
  { isim: "Dragon Duke", tur: "Kahraman", hedef: "Yer ve Hava", not: "Ejder Dükü: Yüksek alan hasarı ve alev nefesiyle hem yer hem hava ordularına liderlik eder.", ipucu: "Sıkışık savunma öbeklerinin üzerine doğru yönlendirildiğinde maksimum hasar çıkarır." },

  // BİRLİKLER (Kışla ve Kara Kışla Açılış Sırasına Göre)
  { isim: "Barbarian", tur: "Birlik", hedef: "Yer", not: "Ucuz ve hızlı yakın dövüş birliği.", ipucu: "Tuzakları tetiklemek ve köşedeki inşaatçı kulübelerini almak için kullanılır." },
  { isim: "Archer", tur: "Birlik", hedef: "Yer ve Hava", not: "Duvar arkasından ateş edebilen menzilli birlik.", ipucu: "Saldırı sonunda %50 hasara ulaşmak için boş binalara bırakılır." },
  { isim: "Giant", tur: "Birlik", hedef: "Savunmalar", not: "Savunmaları hedef alan dayanıklı tank.", ipucu: "Arkasından gelen Büyücü ve Okçuların hasarını üstlenir." },
  { isim: "Goblin", tur: "Birlik", hedef: "Kaynaklar", not: "Kaynak binalarına iki kat hasar verir.", ipucu: "Süper Goblin versiyonu ganimet kasmak ve Belediye Binası avlamak için en iyisidir." },
  { isim: "Wall Breaker", tur: "Birlik", hedef: "Duvarlar", not: "Duvarlara koşup kendini patlatarak yol açar.", ipucu: "Havan topu atışının hemen ardından bırakırsan yolda ölmez." },
  { isim: "Balloon", tur: "Birlik", hedef: "Savunmalar", not: "Yavaş hareket eden ama çok yüksek alan hasarı veren hava birliği.", ipucu: "Öfke ve Hızlandırma büyüleriyle birlikte Hava Savunmalarına hızla ulaştırılır." },
  { isim: "Wizard", tur: "Birlik", hedef: "Yer ve Hava", not: "Yüksek alan hasarlı ama düşük canlı büyücü.", ipucu: "Mutlaka Golem veya Dev gibi bir tankın arkasından bırakılmalıdır." },
  { isim: "Healer", tur: "Birlik", hedef: "Yer Birlikleri", not: "Saldırı yapmaz, dost yer birliklerini ve kahramanları iyileştirir.", ipucu: "Hava Savunması ve Siyah Hava Mayınlarından uzak tutulmalıdır." },
  { isim: "Dragon", tur: "Birlik", hedef: "Yer ve Hava", not: "Yüksek cana ve yakın alan hasarına sahip güçlü hava birliği.", ipucu: "Tek bir noktaya yığmak yerine hat şeklinde yayarak bırakmak daha etkilidir." },
  { isim: "P.E.K.K.A", tur: "Birlik", hedef: "Yer", not: "Ağır zırhlı, çok yüksek yakın dövüş hasarı veren savaşçı.", ipucu: "Tekli Cehennem Kulesine karşı Buz büyüsüyle desteklenmelidir." },
  { isim: "Baby Dragon", tur: "Birlik", hedef: "Yer ve Hava", not: "Etrafında başka hava birliği yokken öfkelenip ekstra hasar verir.", ipucu: "Tek başına bırakılarak dış binaları temizlemek (funnel) için en iyi birliktir." },
  { isim: "Miner", tur: "Birlik", hedef: "Yer", not: "Yeraltından ilerlediği için hareket halindeyken hasar almaz.", ipucu: "Domuz Binicilerle birlikte Hibrit ordularında harika uyum sağlar." },
  { isim: "Electro Dragon", tur: "Birlik", hedef: "Yer ve Hava", not: "Bitişik 5 binaya kadar seken zincirleme yıldırım atar.", ipucu: "Binaların birbirine bitişik olduğu sıkışık düzenlerde maksimum hasar verir." },
  { isim: "Yeti", tur: "Birlik", hedef: "Yer", not: "Hasar aldıkça sırtından duvar atlayan Yetimitler fırlatır.", ipucu: "Yetimitler savunma binalarını uzaktan patlatmak için çok etkilidir." },
  { isim: "Dragon Rider", tur: "Birlik", hedef: "Savunmalar", not: "Doğrudan savunma binalarını hedef alan yüksek hasarlı hava birliği.", ipucu: "Ejderha ve Balonların önünde savunmaları hızla eritir." },
  { isim: "Electro Titan", tur: "Birlik", hedef: "Yer ve Hava", not: "Etrafındaki tüm düşman birliklerine ve binalara sürekli elektrik halesi yayar.", ipucu: "Klan Kalesinden çıkan kalabalık birlikleri ve iskelet tuzaklarını anında eritir." },
  { isim: "Root Rider", tur: "Birlik", hedef: "Savunmalar", not: "Orman Binici: Üzerinden geçtiği tüm duvarları anında yıkan yüksek canlı birlik.", ipucu: "Duvar Yıkıcı veya Atlama büyüsü ihtiyacını ortadan kaldırır." },
  { isim: "Thrower", tur: "Birlik", hedef: "Yer ve Hava", not: "Mızrakçı: Uzun menzilden mızrak fırlatarak duvar arkasındaki hedefleri vurur.", ipucu: "Şifacılarla desteklendiğinde ordunun arkasından güvenli hasar çıkarır." },
  { isim: "Minion", tur: "Birlik", hedef: "Yer ve Hava", not: "Hızlı ve ucuz kara iksir hava birliği.", ipucu: "Hava mayınlarını kontrol etmek ve temizlik yapmak için kullanılır." },
  { isim: "Hog Rider", tur: "Birlik", hedef: "Savunmalar", not: "Duvarların üzerinden atlayıp doğrudan savunmalara saldıran hızlı birlik.", ipucu: "Dev Bombalara karşı İyileştirme büyüsü ile desteklenmelidir." },
  { isim: "Valkyrie", tur: "Birlik", hedef: "Yer", not: "Bitişik binaların arasına girip dönerek hepsine aynı anda vurur.", ipucu: "Öfke büyüsü altında köyün merkezini saniyeler içinde temizler." },
  { isim: "Golem", tur: "Birlik", hedef: "Savunmalar", not: "Devasa can puanına sahip ana tank; ölünce Golemitlere bölünür.", ipucu: "Saldırı başlangıcında tüm savunma ateşini üzerine çekmek için bırakılır." },
  { isim: "Witch", tur: "Birlik", hedef: "Yer ve Hava", not: "Sürekli iskelet ordusu çağıran menzilli büyücü.", ipucu: "Tekli Cehennem Kulelerini kalabalık iskeletlerle oyalayarak etkisiz hale getirir." },
  { isim: "Lava Hound", tur: "Birlik", hedef: "Hava Savunmaları", not: "Doğrudan Hava Savunmalarına uçan dev hava tankı.", ipucu: "Arkasından gelen Balonları hava tuzaklarından ve savunmalardan korur." },
  { isim: "Bowler", tur: "Birlik", hedef: "Yer", not: "İki hedefe birden seken ağır kayalar fırlatır.", ipucu: "Süper Atıcı versiyonu köyün merkezini tek atışta delip geçer." },
  { isim: "Ice Golem", tur: "Birlik", hedef: "Savunmalar", not: "Yok edildiğinde etrafındaki savunmaları ve birlikleri dondurur.", ipucu: "Kahramanların önünde hem tanklık yapar hem de savunmaları kilitler." },
  { isim: "Headhunter", tur: "Birlik", hedef: "Kahramanlar", not: "Rakip kahramanları hedef alır ve onlara zehir etkisi uygular.", ipucu: "Ana ordu rakip Kraliçe veya Kral ile karşılaştığında arkadan bırakılır." },
  { isim: "Apprentice Warden", tur: "Birlik", hedef: "Yer ve Hava", not: "Çırak Koruyucu: Etrafındaki yer birliklerine ek can puanı aurası sağlar.", ipucu: "Orman Binici veya Yeti ordularının canını artırarak hayatta kalmalarını sağlar." },
  { isim: "Druid", tur: "Birlik", hedef: "Yer", not: "Önce birlikleri iyileştirir, öfkelendiğinde ayıya dönüşüp tanklık yapar.", ipucu: "Saldırının ortasında birliklerin canını tazelemek için kullanılır." },

  // BÜYÜLER (Büyü Fabrikası Sırasına Göre)
  { isim: "Lightning Spell", tur: "Büyü", hedef: "Yer ve Hava", not: "Küçük bir alana yüksek yıldırım hasarı verir ve savunmaları sersemletir.", ipucu: "Deprem büyüsüyle birleştirilerek Hava Savunması veya Cehennem Kulesi yok edilir." },
  { isim: "Healing Spell", tur: "Büyü", hedef: "Yer ve Hava", not: "Daire içindeki dost birlikleri zamanla iyileştirir.", ipucu: "Cehennem Kulesinin iyileştirme engelleyici ışınına dikkat edilmelidir." },
  { isim: "Rage Spell", tur: "Büyü", hedef: "Yer ve Hava", not: "Birliklerin saldırı hızını ve hasarını büyük oranda artırır.", ipucu: "Birliklerin tam gireceği yere değil, bir adım ilerisine atılmalıdır." },
  { isim: "Jump Spell", tur: "Büyü", hedef: "Yer Birlikleri", not: "Yer birliklerinin duvarların üzerinden doğrudan atlamasını sağlar.", ipucu: "Kuşatma makinesi olmayan ordularda merkeze yol açmak için kullanılır." },
  { isim: "Freeze Spell", tur: "Büyü", hedef: "Yer ve Hava", not: "Savunmaları ve rakip Klan Kalesi birliklerini geçici olarak dondurur.", ipucu: "Tekli Cehennem Kulesi ışını tam ısındığında atarak tankını kurtar." },
  { isim: "Clone Spell", tur: "Büyü", hedef: "Dost Birlikler", not: "Daire içindeki birliklerin geçici kopyalarını oluşturur.", ipucu: "Zeplin içinden çıkan Süper Okçu veya Balonları çoğaltmak için kullanılır." },
  { isim: "Invisibility Spell", tur: "Büyü", hedef: "Dost Birlikler", not: "Alan içindeki dost birlikleri savunmalara karşı görünmez yapar.", ipucu: "Süper Okçu Zeplin taktiğinde birlikleri hayatta tutmak için kullanılır." },
  { isim: "Recall Spell", tur: "Büyü", hedef: "Dost Birlikler", not: "Sahadaki kahraman ve birlikleri geri çağırıp başka yerden tekrar bırakmanı sağlar.", ipucu: "Kraliçe Yürüyüşü bittikten sonra Kraliçeyi ana ordunun yanına taşımak için harikadır." },
  { isim: "Overgrowth Spell", tur: "Büyü", hedef: "Binalar", not: "Sarmaşık Büyüsü: Geniş bir alandaki savunmaları sarmaşıklarla kapatıp devre dışı bırakır.", ipucu: "Kapatılan binalar hasar da almaz; ordunun yolunu daraltmak (funnel) için kullan." },
  { isim: "Revive Spell", tur: "Büyü", hedef: "Kahramanlar", not: "Canlandırma Büyüsü: Savaşta düşen bir kahramanı belirli bir canla tekrar ayağa kaldırır.", ipucu: "Saldırı sonunda kalan son savunmaları temizlemek için Kral veya Şampiyonu canlandır." },
  { isim: "Poison Spell", tur: "Büyü", hedef: "Düşman Birlikleri", not: "Rakip Klan Kalesi birliklerini ve kahramanları yavaşlatıp hasar verir.", ipucu: "Klan Kalesinden çıkan birliklerin tam üzerine atılmalıdır." },
  { isim: "Earthquake Spell", tur: "Büyü", hedef: "Binalar ve Duvarlar", not: "Binalara can yüzdesine göre hasar verir ve 4 tanesi tüm duvarları yıkar.", ipucu: "Belediye Binası ve etrafındaki savunmaları yumuşatmak için kullanılır." },
  { isim: "Haste Spell", tur: "Büyü", hedef: "Dost Birlikler", not: "Hasar artışı vermez ama birlikleri çok yüksek hıza ulaştırır.", ipucu: "Balon ve Lav Tazısı saldırılarında Öfke büyüsüne göre daha az yer kaplar." },
  { isim: "Skeleton Spell", tur: "Büyü", hedef: "Yer", not: "Belirlenen noktada iskelet grubu çıkararak savunmaları oyalar.", ipucu: "Tekli Cehennem Kulesi veya Monolit dikkatini dağıtmak için birebirdir." },
  { isim: "Bat Spell", tur: "Büyü", hedef: "Savunmalar", not: "Savunmalara saldıran yarasa sürüsü çağırır.", ipucu: "Büyücü Kulesi ve Çoklu Cehennem Kulesi Buz büyüsüyle tutulduğunda köyü siler." },

  // SAVUNMALAR (Açılış Sırasına Göre)
  { isim: "Cannon", tur: "Savunma", hedef: "Yer", not: "Yalnızca yer birliklerine ateş eden temel savunma.", ipucu: "Hava birliklerine karşı tamamen savunmasızdır." },
  { isim: "Archer Tower", tur: "Savunma", hedef: "Yer ve Hava", not: "Uzun menzilli çok yönlü savunma kulesi.", ipucu: "Hem yer hem hava birliklerine hızlı atış yapar." },
  { isim: "Mortar", tur: "Savunma", hedef: "Yer", not: "Uzun menzilli alan hasarı verir, dibindeki birliklere vuramaz.", ipucu: "Okçu ve Büyücü gibi kalabalık gruplara karşı etkilidir." },
  { isim: "Air Defense", tur: "Savunma", hedef: "Hava", not: "Hava birliklerine çok yüksek tekli hedef hasarı verir.", ipucu: "Hava saldırılarında ilk yok edilmesi gereken savunmalardır." },
  { isim: "Wizard Tower", tur: "Savunma", hedef: "Yer ve Hava", not: "Hem yer hem hava gruplarına alan hasarı verir.", ipucu: "Balon ve Yarasa büyüsü sürülerine karşı en büyük tehdittir." },
  { isim: "Air Sweeper", tur: "Savunma", hedef: "Hava", not: "Hava Patlatıcı: Hasar vermez ama hava birliklerini güçlü rüzgarla geri iter.", ipucu: "Saldırıya mutlaka Hava Patlatıcının baktığı yönün tersinden başla." },
  { isim: "Hidden Tesla", tur: "Savunma", hedef: "Yer ve Hava", not: "Birlikler yaklaşana kadar yer altında gizli kalır.", ipucu: "Belediye Binası çevresinde görünmeyen tuzak bölgeleri oluşturur." },
  { isim: "Bomb Tower", tur: "Savunma", hedef: "Yer", not: "Yakındaki yer birliklerine alan hasarı verir ve yıkılınca patlar.", ipucu: "Domuz Binici ve Madenci gruplarına karşı tehlikelidir." },
  { isim: "X-Bow", tur: "Savunma", hedef: "Yer veya Yer+Hava", not: "Çok yüksek atış hızına sahip kesintisiz savunma.", ipucu: "Ayarlandığı moda göre ya sadece yere uzun menzil ya da havaya da orta menzil vurur." },
  { isim: "Inferno Tower", tur: "Savunma", hedef: "Yer ve Hava", not: "Tekli modda tankları eritir, Çoklu modda sürüleri yakar.", ipucu: "Saldırı öncesi mutlaka Tekli mi Çoklu mu ayarlandığı kontrol edilmelidir." },
  { isim: "Eagle Artillery", tur: "Savunma", hedef: "Yer ve Hava", not: "Haritanın her yerine ateş edebilen ağır topçu savunması.", ipucu: "Belirli bir birlik kapasitesi sahaya sürüldüğünde aktifleşir." },
  { isim: "Scattershot", tur: "Savunma", hedef: "Yer ve Hava", not: "Kayasaçar: Çarptığı hedefin arkasına da kaya parçaları saçan ağır savunma.", ipucu: "Şifacı ve Balon gruplarını tek atışta ağır yaralayabilir." },
  { isim: "Builder's Hut", tur: "Savunma", hedef: "Yer ve Hava", not: "Silahlı İnşaatçı Kulübesi: Hem ateş eder hem de hasar alan savunmaları tamir eder.", ipucu: "Saldırı sırasında çevredeki binaları sürekli onardığı için erken indirilmelidir." },
  { isim: "Spell Tower", tur: "Savunma", hedef: "Alan Etkisi", not: "Büyü Kulesi: Seçilen moda göre Öfke, Zehir veya Görünmezlik büyüsü atar.", ipucu: "Görünmezlik modundaysa belediye binasını geçici olarak hedeflenemez yapar." },
  { isim: "Monolith", tur: "Savunma", hedef: "Yer ve Hava", not: "Hedefin maksimum can puanına oranla ekstra hasar veren ölümcül savunma.", ipucu: "Yüksek canlı tank ve kahramanları saniyeler içinde eritir; Buz büyüsü şarttır." },
  { isim: "Ricochet Cannon", tur: "Savunma", hedef: "Yer", not: "Seken Top: Attığı gülle bir hedeften diğerine sekerek iki birliğe birden vurur.", ipucu: "Birleştirilmiş savunmadır; yakın duran yer birliklerine ağır hasar verir." },
  { isim: "Multi-Archer Tower", tur: "Savunma", hedef: "Yer ve Hava", not: "Çoklu Okçu Kulesi: Aynı anda birden fazla hedefe yüksek hasarlı oklar atar.", ipucu: "Hem hava hem yer ordularına karşı çok yüksek saniye başı hasar çıkarır." },
  { isim: "Firespitter", tur: "Savunma", hedef: "Yer ve Hava", not: "Ateş Püskürtücü: Baktığı yöne doğru koni şeklinde yakıcı alev dalgaları gönderir.", ipucu: "Hava Patlatıcı gibi belirli bir yöne bakar; arka tarafından saldırmak çok daha güvenlidir." },

  // KUŞATMA MAKİNELERİ (9 Kuşatma Makinesi - Açılış Sırasına Göre)
  { isim: "Wall Wrecker", tur: "Kuşatma", hedef: "Belediye Binası", not: "Tokmak: Önündeki tüm duvarları ezerek doğrudan Belediye Binasına ilerler.", ipucu: "Klan Kalesi birliklerini köyün tam merkezine kadar güvenle taşımak için kullanılır." },
  { isim: "Battle Blimp", tur: "Kuşatma", hedef: "Belediye Binası", not: "Zeplin: Savunmaların üzerinden uçarak doğrudan Belediye Binasına gider.", ipucu: "İçine Yeti veya Süper Okçu koyarak merkezi güvenli şekilde patlat." },
  { isim: "Stone Slammer", tur: "Kuşatma", hedef: "Savunmalar", not: "Kaya Balonu: Havadan dev kayalar bırakarak savunmalara ve duvarlara alan hasarı verir.", ipucu: "Ejderha ve Balon saldırılarında savunma hattını kırmak için harikadır." },
  { isim: "Siege Barracks", tur: "Kuşatma", hedef: "Dış Alan", not: "Uçan Kışla: İndiği noktadan sırayla P.E.K.K.A ve Büyücüler çıkarır.", ipucu: "Kanat temizliği (funnel) yapmak ve ana ordunun dışarı kaçmasını önlemek için bırakılır." },
  { isim: "Log Launcher", tur: "Kuşatma", hedef: "Belediye Binası", not: "Tomruk Fırlatıcı: İlerlerken önündeki tüm duvar ve binalara hasar veren kütükler fırlatır.", ipucu: "Kartal Topu veya Cehennem Kulesi hizasından bırakılarak iki hedef birden yıpratılır." },
  { isim: "Flame Flinger", tur: "Kuşatma", hedef: "Savunmalar", not: "Alev Atıcı: Çok uzun menzilden ateş topları fırlatarak savunmaları yakar.", ipucu: "X Yayı ve Havan toplarının menziline dikkat edilerek boş bir köşeden bırakılır." },
  { isim: "Battle Drill", tur: "Kuşatma", hedef: "Savunmalar", not: "Savaş Köstebeği: Yeraltından ilerleyerek savunmaların altında çıkar ve onları sersemletir.", ipucu: "Madenci ve Domuz Binici ordularıyla birlikte ilerlediğinde savunmaları kilitler." },
  { isim: "Troop Launcher", tur: "Kuşatma", hedef: "Uzun Menzil", not: "Birlik Atıcı: Uzak mesafeden haritanın içine destek birlikleri ve variller fırlatır.", ipucu: "Ana ordu merkeze girdiğinde arkadan sürekli taze takviye göndermek için idealdir." },
  { isim: "Sky Wagon", tur: "Kuşatma", hedef: "Savunmalar", not: "Uçan Taşıyıcı: Havadan ilerleyerek hedef bölgeye birlik taşıyan ve destek sağlayan kuşatma aracı.", ipucu: "Koruma altına alındığında kritik bir bölgedeki savunmaları aşmak için kullanılır." },
];

const BOLUMLER: { id: "Tümü" | Kategori; etiket: string; ikon: string }[] = [
  { id: "Tümü", etiket: "Tüm Bölümler", ikon: "📚" },
  { id: "Kahraman", etiket: "Kahramanlar", ikon: "👑" },
  { id: "Birlik", etiket: "Birlikler", ikon: "⚔️" },
  { id: "Büyü", etiket: "Büyüler", ikon: "⚡" },
  { id: "Savunma", etiket: "Savunmalar", ikon: "🛡️" },
  { id: "Kuşatma", etiket: "Kuşatma Makineleri", ikon: "🚜" },
];

export default function RehberSayfasi() {
  const [ara, setAra] = useState("");
  const [seciliBolum, setSeciliBolum] = useState<"Tümü" | Kategori>("Tümü");

  const sonuc = LISTE.filter(
    (x) =>
      (seciliBolum === "Tümü" || x.tur === seciliBolum) &&
      (x.isim + " " + tr(x.isim) + " " + x.not + " " + x.ipucu)
        .toLowerCase()
        .includes(ara.trim().toLowerCase())
  );

  return (
    <main
      style={{
        display: "flex",
        alignItems: "stretch",
        minHeight: "calc(100vh - 80px)",
        width: "100%",
        margin: 0,
        padding: 0,
      }}
    >
      {/* EN SOLA SIFIR SABİT İÇİNDEKİLER PANELİ */}
      <aside
        style={{
          width: 270,
          flexShrink: 0,
          padding: "24px 16px",
          background: "var(--kart)",
          borderRight: "1px solid var(--cizgi)",
          position: "sticky",
          top: 74,
          height: "calc(100vh - 74px)",
          overflowY: "auto",
          display: "flex",
          flexDirection: "column",
          gap: 6,
        }}
      >
        <div
          style={{
            fontSize: 13,
            fontWeight: 800,
            textTransform: "uppercase",
            letterSpacing: "0.7px",
            opacity: 0.65,
            padding: "0 10px 12px",
            borderBottom: "1px solid var(--cizgi)",
            marginBottom: 6,
          }}
        >
          📑 Rehber Bölümleri
        </div>

        {BOLUMLER.map((b) => {
          const aktif = seciliBolum === b.id;
          const sayi = b.id === "Tümü" ? LISTE.length : LISTE.filter((x) => x.tur === b.id).length;

          return (
            <button
              key={b.id}
              onClick={() => setSeciliBolum(b.id)}
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                padding: "12px 14px",
                borderRadius: 10,
                border: aktif ? "1px solid var(--vurgu)" : "1px solid transparent",
                background: aktif ? "var(--vurgu)" : "transparent",
                color: aktif ? "#111" : "var(--fg)",
                fontWeight: aktif ? 800 : 600,
                fontSize: 15,
                cursor: "pointer",
                textAlign: "left",
              }}
            >
              <span style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <span>{b.ikon}</span>
                <span>{b.etiket}</span>
              </span>
              <span
                style={{
                  fontSize: 12,
                  padding: "2px 8px",
                  borderRadius: 8,
                  background: aktif ? "rgba(0,0,0,0.16)" : "var(--bg)",
                  fontWeight: 700,
                }}
              >
                {sayi}
              </span>
            </button>
          );
        })}
      </aside>

      {/* SAĞ TARAF: ALT ALTA LİSTELEME ALANI */}
      <section style={{ flex: 1, padding: "28px 36px", minWidth: 0 }}>
        <div style={{ marginBottom: 20 }}>
          <h1 style={{ fontSize: 32, fontWeight: 900, margin: "0 0 6px" }}>Clash of Clans Oyun Rehberi</h1>
          <p style={{ opacity: 0.75, margin: 0, fontSize: 15 }}>
            Soldaki menüden kategori seçebilir veya aşağıdan arama yaparak tüm birimlerin özelliklerini ve taktik ipuçlarını inceleyebilirsin.
          </p>
        </div>

        {/* Arama Çubuğu */}
        <div
          style={{
            display: "flex",
            gap: 12,
            alignItems: "center",
            padding: 14,
            background: "var(--kart)",
            border: "1px solid var(--cizgi)",
            borderRadius: 12,
            marginBottom: 20,
            flexWrap: "wrap",
          }}
        >
          <input
            value={ara}
            onChange={(e) => setAra(e.target.value)}
            placeholder="Birlik, kahraman, büyü, savunma veya taktik ara…"
            maxLength={40}
            aria-label="Rehberde ara"
            style={{
              flex: 1,
              minWidth: 220,
              padding: "11px 15px",
              borderRadius: 10,
              border: "1px solid var(--cizgi)",
              background: "var(--bg)",
              color: "var(--fg)",
              fontSize: 15,
            }}
          />
          <span style={{ fontSize: 14, fontWeight: 700, opacity: 0.75, padding: "0 6px" }}>
            {sonuc.length} kayıt listeleniyor
          </span>
        </div>

        {/* ALT ALTA DÜZENLİ LİSTELEME */}
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {sonuc.map((x) => (
            <div
              key={x.isim}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 18,
                padding: "16px 20px",
                background: "var(--kart)",
                border: "1px solid var(--cizgi)",
                borderRadius: 14,
                flexWrap: "wrap",
              }}
            >
              {/* Sol Görsel */}
              <img
                src={gorselYolu(x.isim)}
                alt={tr(x.isim)}
                width={54}
                height={54}
                style={{
                  borderRadius: 12,
                  objectFit: "cover",
                  flexShrink: 0,
                  border: "1px solid var(--cizgi)",
                  background: "var(--bg)",
                }}
                onError={(e) => {
                  e.currentTarget.style.display = "none";
                }}
              />

              {/* Orta Bilgi (Başlık + Açıklama) */}
              <div style={{ flex: "1 1 280px", minWidth: 0 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap", marginBottom: 4 }}>
                  <strong style={{ fontSize: 17 }}>{tr(x.isim)}</strong>
                  <span
                    style={{
                      fontSize: 12,
                      padding: "2px 9px",
                      borderRadius: 6,
                      background: "var(--bg)",
                      border: "1px solid var(--cizgi)",
                      fontWeight: 700,
                      opacity: 0.85,
                    }}
                  >
                    {x.tur} · Hedef: {x.hedef}
                  </span>
                </div>
                <p style={{ margin: 0, fontSize: 14, opacity: 0.85, lineHeight: 1.45 }}>{x.not}</p>
              </div>

              {/* Sağ Taktik İpucu Kutusu */}
              <div
                style={{
                  flex: "1 1 320px",
                  padding: "10px 14px",
                  borderRadius: 10,
                  background: "var(--bg)",
                  border: "1px solid var(--cizgi)",
                  fontSize: 13,
                  lineHeight: 1.45,
                }}
              >
                💡 <strong>Taktik İpucu:</strong> {x.ipucu}
              </div>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}