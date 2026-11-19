"use client";
import { useState } from "react";
import { tr } from "../isimler";
import { gorselYolu } from "../gorseller";

type Kategori = "Kahraman" | "Birlik" | "Takım Kışlası" | "Büyü" | "Savunma" | "Kuşatma";

type RehberOgesi = {
  id: string;
  baslik: string;
  tur: Kategori;
  hedef: string;
  not: string;
  ipucu: string;
  gorsel?: string;
  rozet?: string;
};

const LISTE: RehberOgesi[] = [
  // KAHRAMANLAR (6 Kahraman)
  { id: "hero-barbarian-king", baslik: tr("Barbarian King"), tur: "Kahraman", hedef: "Yer", not: "Yüksek canlı yakın dövüş tankı.", ipucu: "Dış binaları temizleyip ana orduyu merkeze yönlendirmek (funnel) için idealdir.", gorsel: gorselYolu("Barbarian King"), rozet: "👑" },
  { id: "hero-archer-queen", baslik: tr("Archer Queen"), tur: "Kahraman", hedef: "Yer ve Hava", not: "Uzun menzilli yüksek tekli hedef hasarı.", ipucu: "Şifacılarla yapılan Kraliçe Yürüyüşü ile Klan Kalesini ve kritik savunmaları alır.", gorsel: gorselYolu("Archer Queen"), rozet: "👑" },
  { id: "hero-grand-warden", baslik: tr("Grand Warden"), tur: "Kahraman", hedef: "Yer ve Hava", not: "Ordunun etrafına can halesi veren destek kahramanı.", ipucu: "Sonsuz Büyük Kitap (Eternal Tome) yeteneğini Belediye Binası patlamasına sakla.", gorsel: gorselYolu("Grand Warden"), rozet: "👑" },
  { id: "hero-royal-champion", baslik: tr("Royal Champion"), tur: "Kahraman", hedef: "Savunmalar", not: "Duvarların üzerinden atlayıp doğrudan savunmalara koşar.", ipucu: "Ana ordu ilerlerken yan kanattan bırakılıp kalan savunmaları temizler.", gorsel: gorselYolu("Royal Champion"), rozet: "👑" },
  { id: "hero-minion-prince", baslik: tr("Minion Prince"), tur: "Kahraman", hedef: "Yer ve Hava", not: "Hava saldırılarına özel yüksek hasarlı uçan kahraman.", ipucu: "Ejderha ve Balon ordularının arkasından bırakıldığında savunmaları hızla eritir.", gorsel: gorselYolu("Minion Prince"), rozet: "👑" },
  { id: "hero-dragon-duke", baslik: tr("Dragon Duke"), tur: "Kahraman", hedef: "Yer ve Hava", not: "Ejder Dükü: Yüksek alan hasarı ve alev nefesiyle hem yer hem hava ordularına liderlik eder.", ipucu: "Sıkışık savunma öbeklerinin üzerine doğru yönlendirildiğinde maksimum hasar çıkarır.", gorsel: gorselYolu("Dragon Duke"), rozet: "👑" },

  // BİRLİKLER (Kışla ve Kara Kışla Açılış Sırasına Göre)
  { id: "troop-barbarian", baslik: tr("Barbarian"), tur: "Birlik", hedef: "Yer", not: "Ucuz ve hızlı yakın dövüş birliği.", ipucu: "Tuzakları tetiklemek ve köşedeki inşaatçı kulübelerini almak için kullanılır.", gorsel: gorselYolu("Barbarian") },
  { id: "troop-archer", baslik: tr("Archer"), tur: "Birlik", hedef: "Yer ve Hava", not: "Duvar arkasından ateş edebilen menzilli birlik.", ipucu: "Saldırı sonunda %50 hasara ulaşmak için boş binalara bırakılır.", gorsel: gorselYolu("Archer") },
  { id: "troop-giant", baslik: tr("Giant"), tur: "Birlik", hedef: "Savunmalar", not: "Savunmaları hedef alan dayanıklı tank.", ipucu: "Arkasından gelen Büyücü ve Okçuların hasarını üstlenir.", gorsel: gorselYolu("Giant") },
  { id: "troop-goblin", baslik: tr("Goblin"), tur: "Birlik", hedef: "Kaynaklar", not: "Kaynak binalarına iki kat hasar verir.", ipucu: "Süper Goblin versiyonu ganimet kasmak ve Belediye Binası avlamak için en iyisidir.", gorsel: gorselYolu("Goblin") },
  { id: "troop-wall-breaker", baslik: tr("Wall Breaker"), tur: "Birlik", hedef: "Duvarlar", not: "Duvarlara koşup kendini patlatarak yol açar.", ipucu: "Havan topu atışının hemen ardından bırakırsan yolda ölmez.", gorsel: gorselYolu("Wall Breaker") },
  { id: "troop-balloon", baslik: tr("Balloon"), tur: "Birlik", hedef: "Savunmalar", not: "Yavaş hareket eden ama çok yüksek alan hasarı veren hava birliği.", ipucu: "Öfke ve Hızlandırma büyüleriyle birlikte Hava Savunmalarına hızla ulaştırılır.", gorsel: gorselYolu("Balloon") },
  { id: "troop-wizard", baslik: tr("Wizard"), tur: "Birlik", hedef: "Yer ve Hava", not: "Yüksek alan hasarlı ama düşük canlı büyücü.", ipucu: "Mutlaka Golem veya Dev gibi bir tankın arkasından bırakılmalıdır.", gorsel: gorselYolu("Wizard") },
  { id: "troop-healer", baslik: tr("Healer"), tur: "Birlik", hedef: "Yer Birlikleri", not: "Saldırı yapmaz, dost yer birliklerini ve kahramanları iyileştirir.", ipucu: "Hava Savunması ve Siyah Hava Mayınlarından uzak tutulmalıdır.", gorsel: gorselYolu("Healer") },
  { id: "troop-dragon", baslik: tr("Dragon"), tur: "Birlik", hedef: "Yer ve Hava", not: "Yüksek cana ve yakın alan hasarına sahip güçlü hava birliği.", ipucu: "Tek bir noktaya yığmak yerine hat şeklinde yayarak bırakmak daha etkilidir.", gorsel: gorselYolu("Dragon") },
  { id: "troop-pekka", baslik: tr("P.E.K.K.A"), tur: "Birlik", hedef: "Yer", not: "Ağır zırhlı, çok yüksek yakın dövüş hasarı veren savaşçı.", ipucu: "Tekli Cehennem Kulesine karşı Buz büyüsüyle desteklenmelidir.", gorsel: gorselYolu("P.E.K.K.A") },
  { id: "troop-baby-dragon", baslik: tr("Baby Dragon"), tur: "Birlik", hedef: "Yer ve Hava", not: "Etrafında başka hava birliği yokken öfkelenip ekstra hasar verir.", ipucu: "Tek başına bırakılarak dış binaları temizlemek (funnel) için en iyi birliktir.", gorsel: gorselYolu("Baby Dragon") },
  { id: "troop-miner", baslik: tr("Miner"), tur: "Birlik", hedef: "Yer", not: "Yeraltından ilerlediği için hareket halindeyken hasar almaz.", ipucu: "Domuz Binicilerle birlikte Hibrit ordularında harika uyum sağlar.", gorsel: gorselYolu("Miner") },
  { id: "troop-electro-dragon", baslik: tr("Electro Dragon"), tur: "Birlik", hedef: "Yer ve Hava", not: "Bitişik 5 binaya kadar seken zincirleme yıldırım atar.", ipucu: "Binaların birbirine bitişik olduğu sıkışık düzenlerde maksimum hasar verir.", gorsel: gorselYolu("Electro Dragon") },
  { id: "troop-yeti", baslik: tr("Yeti"), tur: "Birlik", hedef: "Yer", not: "Hasar aldıkça sırtından duvar atlayan Yetimitler fırlatır.", ipucu: "Yetimitler savunma binalarını uzaktan patlatmak için çok etkilidir.", gorsel: gorselYolu("Yeti") },
  { id: "troop-dragon-rider", baslik: tr("Dragon Rider"), tur: "Birlik", hedef: "Savunmalar", not: "Doğrudan savunma binalarını hedef alan yüksek hasarlı hava birliği.", ipucu: "Ejderha ve Balonların önünde savunmaları hızla eritir.", gorsel: gorselYolu("Dragon Rider") },
  { id: "troop-electro-titan", baslik: tr("Electro Titan"), tur: "Birlik", hedef: "Yer ve Hava", not: "Etrafındaki tüm düşman birliklerine ve binalara sürekli elektrik halesi yayar.", ipucu: "Klan Kalesinden çıkan kalabalık birlikleri ve iskelet tuzaklarını anında eritir.", gorsel: gorselYolu("Electro Titan") },
  { id: "troop-root-rider", baslik: tr("Root Rider"), tur: "Birlik", hedef: "Savunmalar", not: "Orman Binici: Üzerinden geçtiği tüm duvarları anında yıkan yüksek canlı birlik.", ipucu: "Duvar Yıkıcı veya Atlama büyüsü ihtiyacını ortadan kaldırır.", gorsel: gorselYolu("Root Rider") },
  { id: "troop-thrower", baslik: tr("Thrower"), tur: "Birlik", hedef: "Yer ve Hava", not: "Mızrakçı: Uzun menzilden mızrak fırlatarak duvar arkasındaki hedefleri vurur.", ipucu: "Şifacılarla desteklendiğinde ordunun arkasından güvenli hasar çıkarır.", gorsel: gorselYolu("Thrower") },
  { id: "troop-minion", baslik: tr("Minion"), tur: "Birlik", hedef: "Yer ve Hava", not: "Hızlı ve ucuz kara iksir hava birliği.", ipucu: "Hava mayınlarını kontrol etmek ve temizlik yapmak için kullanılır.", gorsel: gorselYolu("Minion") },
  { id: "troop-hog-rider", baslik: tr("Hog Rider"), tur: "Birlik", hedef: "Savunmalar", not: "Duvarların üzerinden atlayıp doğrudan savunmalara saldıran hızlı birlik.", ipucu: "Dev Bombalara karşı İyileştirme büyüsü ile desteklenmelidir.", gorsel: gorselYolu("Hog Rider") },
  { id: "troop-valkyrie", baslik: tr("Valkyrie"), tur: "Birlik", hedef: "Yer", not: "Bitişik binaların arasına girip dönerek hepsine aynı anda vurur.", ipucu: "Öfke büyüsü altında köyün merkezini saniyeler içinde temizler.", gorsel: gorselYolu("Valkyrie") },
  { id: "troop-golem", baslik: tr("Golem"), tur: "Birlik", hedef: "Savunmalar", not: "Devasa can puanına sahip ana tank; ölünce Golemitlere bölünür.", ipucu: "Saldırı başlangıcında tüm savunma ateşini üzerine çekmek için bırakılır.", gorsel: gorselYolu("Golem") },
  { id: "troop-witch", baslik: tr("Witch"), tur: "Birlik", hedef: "Yer ve Hava", not: "Sürekli iskelet ordusu çağıran menzilli büyücü.", ipucu: "Tekli Cehennem Kulelerini kalabalık iskeletlerle oyalayarak etkisiz hale getirir.", gorsel: gorselYolu("Witch") },
  { id: "troop-lava-hound", baslik: tr("Lava Hound"), tur: "Birlik", hedef: "Hava Savunmaları", not: "Doğrudan Hava Savunmalarına uçan dev hava tankı.", ipucu: "Arkasından gelen Balonları hava tuzaklarından ve savunmalardan korur.", gorsel: gorselYolu("Lava Hound") },
  { id: "troop-bowler", baslik: tr("Bowler"), tur: "Birlik", hedef: "Yer", not: "İki hedefe birden seken ağır kayalar fırlatır.", ipucu: "Süper Atıcı versiyonu köyün merkezini tek atışta delip geçer.", gorsel: gorselYolu("Bowler") },
  { id: "troop-ice-golem", baslik: tr("Ice Golem"), tur: "Birlik", hedef: "Savunmalar", not: "Yok edildiğinde etrafındaki savunmaları ve birlikleri dondurur.", ipucu: "Kahramanların önünde hem tanklık yapar hem de savunmaları kilitler.", gorsel: gorselYolu("Ice Golem") },
  { id: "troop-headhunter", baslik: tr("Headhunter"), tur: "Birlik", hedef: "Kahramanlar", not: "Rakip kahramanları hedef alır ve onlara zehir etkisi uygular.", ipucu: "Ana ordu rakip Kraliçe veya Kral ile karşılaştığında arkadan bırakılır.", gorsel: gorselYolu("Headhunter") },
  { id: "troop-apprentice-warden", baslik: tr("Apprentice Warden"), tur: "Birlik", hedef: "Yer ve Hava", not: "Çırak Koruyucu: Etrafındaki yer birliklerine ek can puanı aurası sağlar.", ipucu: "Orman Binici veya Yeti ordularının canını artırarak hayatta kalmalarını sağlar.", gorsel: gorselYolu("Apprentice Warden") },
  { id: "troop-druid", baslik: tr("Druid"), tur: "Birlik", hedef: "Yer", not: "Önce birlikleri iyileştirir, öfkelendiğinde ayıya dönüşüp tanklık yapar.", ipucu: "Saldırının ortasında birliklerin canını tazelemek için kullanılır.", gorsel: gorselYolu("Druid") },

  // TAKIM KIŞLASI (Squad Barracks — BB 8–19, 12 Kademe & 12 Takım)
  {
    id: "squad-barracks-info",
    baslik: "Takım Kışlası (12 Seviye · BB 8–19)",
    tur: "Takım Kışlası",
    hedef: "Sabit Dizilim / Ordu Kampları",
    not: "3×3 boyutta, BB 8'de açılan ve 12 kademeye ulaşan kışladır. Takım eğitimi kaynak ve süre istemez, anlıktır, yükseltme sırasında da devam eder ve Klan Kalesine bağışlanamaz. İçindeki birliklerin seviyeleri Laboratuvar araştırmalarından alınır; takımların kendi 2. ve 3. seviye yükseltmeleri BB 19 ve Laboratuvar Sv. 17 gerektirir.",
    ipucu: "Takım kademesi 2+ olduğunda özel takım yetenekleri açılır; toplam kamp alanı Kartal Topu/Monolit Oku etkilerinde baz alınır.",
    rozet: "🪖",
  },
  {
    id: "squad-1-barch",
    baslik: "1. Barch Takımı (Kışla Sv. 1 · BB 8)",
    tur: "Takım Kışlası",
    hedef: "Yer ve Hava (15 Barbar + 15 Okçu)",
    not: "Kışla 1. seviyede açılır. Alan Hasarı Direnci (Splash Resistance): Tek bir alan hasarı vuruşunun aynı anda vurabileceği takım birliği sayısını sınırlar (Sv. 2'de en fazla 6, Sv. 3'te 5 birim).",
    ipucu: "Erken temizlik, dış binalar ve yüzde toplamak için pratik başlangıç takımıdır.",
    gorsel: gorselYolu("Barbarian"),
    rozet: "🪖",
  },
  {
    id: "squad-2-giant-wizard",
    baslik: "2. Dev Büyücü Takımı (Kışla Sv. 2 · BB 9)",
    tur: "Takım Kışlası",
    hedef: "Yer ve Hava (3 Dev + 5 Büyücü)",
    not: "Kışla 2. seviyede açılır. Alan Hasarı Direnci (Splash Resistance): Tek alan vuruşundan etkilenen takım birliği sayısını sınırlar (Sv. 2'de en fazla 5, Sv. 3'te 4 birim).",
    ipucu: "Devler önden savunma ateşini çekerken Büyücüler arkadan yüksek hasar verir.",
    gorsel: gorselYolu("Giant"),
    rozet: "🪖",
  },
  {
    id: "squad-3-wall-breaker",
    baslik: "3. Duvar Yıkıcı Takımı (Kışla Sv. 3 · BB 10)",
    tur: "Takım Kışlası",
    hedef: "Duvarlar (5 Duvar Yıkıcı)",
    not: "Kışla 3. seviyede açılır. Gizli Başlangıç (Stealthy Start): Bırakıldıktan sonra kısa süre görünmezlik kazanır (Sv. 2'de 3 sn, Sv. 3'te 4 sn); sonradan bırakılan birlikler de kendi süresini alır.",
    ipucu: "Savunma hatlarına girerken duvarları güvenli açmak için ana ordudan hemen önce bırak.",
    gorsel: gorselYolu("Wall Breaker"),
    rozet: "🪖",
  },
  {
    id: "squad-4-minion",
    baslik: "4. Minyon Takımı (Kışla Sv. 4 · BB 11)",
    tur: "Takım Kışlası",
    hedef: "Yer ve Hava",
    not: "Kışla 4. seviyede açılır. Alan Hasarı Direnci (Splash Resistance): Tek alan vuruşunun vurabileceği takım birliği sayısını sınırlar (Sv. 2'de en fazla 3, Sv. 3'te 2 birim).",
    ipucu: "Hava mayınlarını yoklamak ve dış kanatlarda temizlik yapmak için etkilidir.",
    gorsel: gorselYolu("Minion"),
    rozet: "🪖",
  },
  {
    id: "squad-5-balloon",
    baslik: "5. Balon Takımı (Kışla Sv. 5 · BB 12)",
    tur: "Takım Kışlası",
    hedef: "Savunmalar",
    not: "Kışla 5. seviyede açılır. Tuzak Sezisi (Trap Sense): Tuzaklardan alınan hasarı azaltır (Sv. 2'de %15, Sv. 3'te %20 azalma).",
    ipucu: "Hava mayınlarının yoğun olduğu bölgelerde savunma hattını kırmak için kullan.",
    gorsel: gorselYolu("Balloon"),
    rozet: "🪖",
  },
  {
    id: "squad-6-golem-witch",
    baslik: "6. Golem Cadı Takımı (Kışla Sv. 6 · BB 13)",
    tur: "Takım Kışlası",
    hedef: "Yer ve Hava (Golem + Cadı)",
    not: "Kışla 6. seviyede açılır. Önce Golemler, ardından Cadılar sahaya iner. Alan Hasarı Direnci (Splash Resistance): Cadıların alabileceği alan hasarı hedef sayısını sınırlar (Sv. 2'de en fazla 3, Sv. 3'te 2 birim).",
    ipucu: "İskelet üretimi ve alan hasarı direnci sayesinde savunmaları uzun süre oyalar.",
    gorsel: gorselYolu("Witch"),
    rozet: "🪖",
  },
  {
    id: "squad-7-hog-rider",
    baslik: "7. Domuz Binicisi Takımı (Kışla Sv. 7 · BB 14)",
    tur: "Takım Kışlası",
    hedef: "Savunmalar",
    not: "Kışla 7. seviyede açılır. Tuzak Sezisi (Trap Sense): Tuzaklardan alınan hasarı azaltır (Sv. 2'de %30, Sv. 3'te %40 azalma).",
    ipucu: "Duvar atlayan hızlı savunma baskınlarında Dev Bomba hasarını hafifletir.",
    gorsel: gorselYolu("Hog Rider"),
    rozet: "🪖",
  },
  {
    id: "squad-8-miner",
    baslik: "8. Madenci Takımı (Kışla Sv. 8 · BB 15)",
    tur: "Takım Kışlası",
    hedef: "Yer",
    not: "Kışla 8. seviyede açılır. Tuzak Sezisi (Trap Sense): Tuzaklardan alınan hasarı azaltır (Sv. 2'de %30, Sv. 3'te %40 azalma).",
    ipucu: "Yeraltı geçişleriyle savunmaları yarıp ana ordunun ilerleyişini hızlandırır.",
    gorsel: gorselYolu("Miner"),
    rozet: "🪖",
  },
  {
    id: "squad-9-healer",
    baslik: "9. Şifacı Takımı (Kışla Sv. 9 · BB 16)",
    tur: "Takım Kışlası",
    hedef: "Yer Birlikleri",
    not: "Kışla 9. seviyede açılır. Kalkanlı Başlangıç (Shielded Start): Bırakıldıktan sonra kısa süre hasara karşı bağışıklık kazanır (Sv. 2'de 2 sn, Sv. 3'te 3 sn).",
    ipucu: "Hava Savunması veya mayın menziline girerken ilk saniyelerde hayatta kalmalarına yardımcı olur.",
    gorsel: gorselYolu("Healer"),
    rozet: "🪖",
  },
  {
    id: "squad-10-pekka-titan",
    baslik: "10. P.E.K.K.A Titan Takımı (Kışla Sv. 10 · BB 17)",
    tur: "Takım Kışlası",
    hedef: "Yer ve Hava (P.E.K.K.A + Elektro Titan)",
    not: "Kışla 10. seviyede açılır. Odaklanmış Saldırı (Focus Attack): Mümkün olduğunca aynı hedefe birlikte saldırırlar (Sv. 3'te alan ihtiyacı 46'dan 44'e düşer).",
    ipucu: "Kritik savunmaları veya merkez binaları tek seferde eritmek için birlikte odaklanır.",
    gorsel: gorselYolu("Electro Titan"),
    rozet: "🪖",
  },
  {
    id: "squad-11-dragons",
    baslik: "11. Ejderhalar Takımı (Kışla Sv. 11 · BB 18)",
    tur: "Takım Kışlası",
    hedef: "Yer ve Hava (Ejderha + 2 Ejderha Binicisi)",
    not: "Kışla 11. seviyede açılır. Kalkanlı Başlangıç (Shielded Start): Bırakıldıktan sonra kısa süre hasara karşı bağışıklık kazanır (Sv. 2'de 2 sn, Sv. 3'te 3 sn).",
    ipucu: "Hava saldırısı girişinde ilk darbeleri kalkan altında karşılayıp savunma hattını yarar.",
    gorsel: gorselYolu("Dragon Rider"),
    rozet: "🪖",
  },
  {
    id: "squad-12-baby-dragon",
    baslik: "12. Bebek Ejderha Takımı (Kışla Sv. 12 · BB 19)",
    tur: "Takım Kışlası",
    hedef: "Yer ve Hava (3 Bebek Ejderha)",
    not: "Kışla 12. seviyede açılır. Öfke Koruması (Tantrum): Etraflarındaki tek hava birlikleri birbirleri olsa bile Öfke (Tantrum) yeteneklerini kaybetmezler (Sv. 3'te alan ihtiyacı 26'dan 24'e düşer).",
    ipucu: "Birlikte bırakıldıklarında bile öfkeli hasar avantajını koruyarak hızlı temizlik yaparlar.",
    gorsel: gorselYolu("Baby Dragon"),
    rozet: "🪖",
  },

  // BÜYÜLER (Büyü Fabrikası Sırasına Göre)
  { id: "spell-lightning", baslik: tr("Lightning Spell"), tur: "Büyü", hedef: "Yer ve Hava", not: "Küçük bir alana yüksek yıldırım hasarı verir ve savunmaları sersemletir.", ipucu: "Deprem büyüsüyle birleştirilerek Hava Savunması veya Cehennem Kulesi yok edilir.", gorsel: gorselYolu("Lightning Spell") },
  { id: "spell-healing", baslik: tr("Healing Spell"), tur: "Büyü", hedef: "Yer ve Hava", not: "Daire içindeki dost birlikleri zamanla iyileştirir.", ipucu: "Cehennem Kulesinin iyileştirme engelleyici ışınına dikkat edilmelidir.", gorsel: gorselYolu("Healing Spell") },
  { id: "spell-rage", baslik: tr("Rage Spell"), tur: "Büyü", hedef: "Yer ve Hava", not: "Birliklerin saldırı hızını ve hasarını büyük oranda artırır.", ipucu: "Birliklerin tam gireceği yere değil, bir adım ilerisine atılmalıdır.", gorsel: gorselYolu("Rage Spell") },
  { id: "spell-jump", baslik: tr("Jump Spell"), tur: "Büyü", hedef: "Yer Birlikleri", not: "Yer birliklerinin duvarların üzerinden doğrudan atlamasını sağlar.", ipucu: "Kuşatma makinesi olmayan ordularda merkeze yol açmak için kullanılır.", gorsel: gorselYolu("Jump Spell") },
  { id: "spell-freeze", baslik: tr("Freeze Spell"), tur: "Büyü", hedef: "Yer ve Hava", not: "Savunmaları ve rakip Klan Kalesi birliklerini geçici olarak dondurur.", ipucu: "Tekli Cehennem Kulesi ışını tam ısındığında atarak tankını kurtar.", gorsel: gorselYolu("Freeze Spell") },
  { id: "spell-clone", baslik: tr("Clone Spell"), tur: "Büyü", hedef: "Dost Birlikler", not: "Daire içindeki birliklerin geçici kopyalarını oluşturur.", ipucu: "Zeplin içinden çıkan Süper Okçu veya Balonları çoğaltmak için kullanılır.", gorsel: gorselYolu("Clone Spell") },
  { id: "spell-invisibility", baslik: tr("Invisibility Spell"), tur: "Büyü", hedef: "Dost Birlikler", not: "Alan içindeki dost birlikleri savunmalara karşı görünmez yapar.", ipucu: "Süper Okçu Zeplin taktiğinde birlikleri hayatta tutmak için kullanılır.", gorsel: gorselYolu("Invisibility Spell") },
  { id: "spell-recall", baslik: tr("Recall Spell"), tur: "Büyü", hedef: "Dost Birlikler", not: "Sahadaki kahraman ve birlikleri geri çağırıp başka yerden tekrar bırakmanı sağlar.", ipucu: "Kraliçe Yürüyüşü bittikten sonra Kraliçeyi ana ordunun yanına taşımak için harikadır.", gorsel: gorselYolu("Recall Spell") },
  { id: "spell-overgrowth", baslik: tr("Overgrowth Spell"), tur: "Büyü", hedef: "Binalar", not: "Sarmaşık Büyüsü: Geniş bir alandaki savunmaları sarmaşıklarla kapatıp devre dışı bırakır.", ipucu: "Kapatılan binalar hasar da almaz; ordunun yolunu daraltmak (funnel) için kullan.", gorsel: gorselYolu("Overgrowth Spell") },
  { id: "spell-revive", baslik: tr("Revive Spell"), tur: "Büyü", hedef: "Kahramanlar", not: "Canlandırma Büyüsü: Savaşta düşen bir kahramanı belirli bir canla tekrar ayağa kaldırır.", ipucu: "Saldırı sonunda kalan son savunmaları temizlemek için Kral veya Şampiyonu canlandır.", gorsel: gorselYolu("Revive Spell") },
  { id: "spell-poison", baslik: tr("Poison Spell"), tur: "Büyü", hedef: "Düşman Birlikleri", not: "Rakip Klan Kalesi birliklerini ve kahramanları yavaşlatıp hasar verir.", ipucu: "Klan Kalesinden çıkan birliklerin tam üzerine atılmalıdır.", gorsel: gorselYolu("Poison Spell") },
  { id: "spell-earthquake", baslik: tr("Earthquake Spell"), tur: "Büyü", hedef: "Binalar ve Duvarlar", not: "Binalara can yüzdesine göre hasar verir ve 4 tanesi tüm duvarları yıkar.", ipucu: "Belediye Binası ve etrafındaki savunmaları yumuşatmak için kullanılır.", gorsel: gorselYolu("Earthquake Spell") },
  { id: "spell-haste", baslik: tr("Haste Spell"), tur: "Büyü", hedef: "Dost Birlikler", not: "Hasar artışı vermez ama birlikleri çok yüksek hıza ulaştırır.", ipucu: "Balon ve Lav Tazısı saldırılarında Öfke büyüsüne göre daha az yer kaplar.", gorsel: gorselYolu("Haste Spell") },
  { id: "spell-skeleton", baslik: tr("Skeleton Spell"), tur: "Büyü", hedef: "Yer", not: "Belirlenen noktada iskelet grubu çıkararak savunmaları oyalar.", ipucu: "Tekli Cehennem Kulesi veya Monolit dikkatini dağıtmak için birebirdir.", gorsel: gorselYolu("Skeleton Spell") },
  { id: "spell-bat", baslik: tr("Bat Spell"), tur: "Büyü", hedef: "Savunmalar", not: "Savunmalara saldıran yarasa sürüsü çağırır.", ipucu: "Büyücü Kulesi ve Çoklu Cehennem Kulesi Buz büyüsüyle tutulduğunda köyü siler.", gorsel: gorselYolu("Bat Spell") },

  // SAVUNMALAR (Açılış Sırasına Göre)
  { id: "def-cannon", baslik: tr("Cannon"), tur: "Savunma", hedef: "Yer", not: "Yalnızca yer birliklerine ateş eden temel savunma.", ipucu: "Hava birliklerine karşı tamamen savunmasızdır.", gorsel: gorselYolu("Cannon") },
  { id: "def-archer-tower", baslik: tr("Archer Tower"), tur: "Savunma", hedef: "Yer ve Hava", not: "Uzun menzilli çok yönlü savunma kulesi.", ipucu: "Hem yer hem hava birliklerine hızlı atış yapar.", gorsel: gorselYolu("Archer Tower") },
  { id: "def-mortar", baslik: tr("Mortar"), tur: "Savunma", hedef: "Yer", not: "Uzun menzilli alan hasarı verir, dibindeki birliklere vuramaz.", ipucu: "Okçu ve Büyücü gibi kalabalık gruplara karşı etkilidir.", gorsel: gorselYolu("Mortar") },
  { id: "def-air-defense", baslik: tr("Air Defense"), tur: "Savunma", hedef: "Hava", not: "Hava birliklerine çok yüksek tekli hedef hasarı verir.", ipucu: "Hava saldırılarında ilk yok edilmesi gereken savunmalardır.", gorsel: gorselYolu("Air Defense") },
  { id: "def-wizard-tower", baslik: tr("Wizard Tower"), tur: "Savunma", hedef: "Yer ve Hava", not: "Hem yer hem hava gruplarına alan hasarı verir.", ipucu: "Balon ve Yarasa büyüsü sürülerine karşı en büyük tehdittir.", gorsel: gorselYolu("Wizard Tower") },
  { id: "def-air-sweeper", baslik: tr("Air Sweeper"), tur: "Savunma", hedef: "Hava", not: "Hava Patlatıcı: Hasar vermez ama hava birliklerini güçlü rüzgarla geri iter.", ipucu: "Saldırıya mutlaka Hava Patlatıcının baktığı yönün tersinden başla.", gorsel: gorselYolu("Air Sweeper") },
  { id: "def-hidden-tesla", baslik: tr("Hidden Tesla"), tur: "Savunma", hedef: "Yer ve Hava", not: "Birlikler yaklaşana kadar yer altında gizli kalır.", ipucu: "Belediye Binası çevresinde görünmeyen tuzak bölgeleri oluşturur.", gorsel: gorselYolu("Hidden Tesla") },
  { id: "def-bomb-tower", baslik: tr("Bomb Tower"), tur: "Savunma", hedef: "Yer", not: "Yakındaki yer birliklerine alan hasarı verir ve yıkılınca patlar.", ipucu: "Domuz Binici ve Madenci gruplarına karşı tehlikelidir.", gorsel: gorselYolu("Bomb Tower") },
  { id: "def-x-bow", baslik: tr("X-Bow"), tur: "Savunma", hedef: "Yer veya Yer+Hava", not: "Çok yüksek atış hızına sahip kesintisiz savunma.", ipucu: "Ayarlandığı moda göre ya sadece yere uzun menzil ya da havaya da orta menzil vurur.", gorsel: gorselYolu("X-Bow") },
  { id: "def-inferno-tower", baslik: tr("Inferno Tower"), tur: "Savunma", hedef: "Yer ve Hava", not: "Tekli modda tankları eritir, Çoklu modda sürüleri yakar.", ipucu: "Saldırı öncesi mutlaka Tekli mi Çoklu mu ayarlandığı kontrol edilmelidir.", gorsel: gorselYolu("Inferno Tower") },
  { id: "def-eagle-artillery", baslik: tr("Eagle Artillery"), tur: "Savunma", hedef: "Yer ve Hava", not: "Haritanın her yerine ateş edebilen ağır topçu savunması.", ipucu: "Belirli bir birlik kapasitesi sahaya sürüldüğünde aktifleşir.", gorsel: gorselYolu("Eagle Artillery") },
  { id: "def-scattershot", baslik: tr("Scattershot"), tur: "Savunma", hedef: "Yer ve Hava", not: "Kayasaçar: Çarptığı hedefin arkasına da kaya parçaları saçan ağır savunma.", ipucu: "Şifacı ve Balon gruplarını tek atışta ağır yaralayabilir.", gorsel: gorselYolu("Scattershot") },
  { id: "def-builders-hut", baslik: tr("Builder's Hut"), tur: "Savunma", hedef: "Yer ve Hava", not: "Silahlı İnşaatçı Kulübesi: Hem ateş eder hem de hasar alan savunmaları tamir eder.", ipucu: "Saldırı sırasında çevredeki binaları sürekli onardığı için erken indirilmelidir.", gorsel: gorselYolu("Builder's Hut") },
  { id: "def-spell-tower", baslik: tr("Spell Tower"), tur: "Savunma", hedef: "Alan Etkisi", not: "Büyü Kulesi: Seçilen moda göre Öfke, Zehir veya Görünmezlik büyüsü atar.", ipucu: "Görünmezlik modundaysa belediye binasını geçici olarak hedeflenemez yapar.", gorsel: gorselYolu("Spell Tower") },
  { id: "def-monolith", baslik: tr("Monolith"), tur: "Savunma", hedef: "Yer ve Hava", not: "Hedefin maksimum can puanına oranla ekstra hasar veren ölümcül savunma.", ipucu: "Yüksek canlı tank ve kahramanları saniyeler içinde eritir; Buz büyüsü şarttır.", gorsel: gorselYolu("Monolith") },
  { id: "def-ricochet-cannon", baslik: tr("Ricochet Cannon"), tur: "Savunma", hedef: "Yer", not: "Seken Top: Attığı gülle bir hedeften diğerine sekerek iki birliğe birden vurur.", ipucu: "Birleştirilmiş savunmadır; yakın duran yer birliklerine ağır hasar verir.", gorsel: gorselYolu("Ricochet Cannon") },
  { id: "def-multi-archer-tower", baslik: tr("Multi-Archer Tower"), tur: "Savunma", hedef: "Yer ve Hava", not: "Çoklu Okçu Kulesi: Aynı anda birden fazla hedefe yüksek hasarlı oklar atar.", ipucu: "Hem hava hem yer ordularına karşı çok yüksek saniye başı hasar çıkarır.", gorsel: gorselYolu("Multi-Archer Tower") },
  { id: "def-firespitter", baslik: tr("Firespitter"), tur: "Savunma", hedef: "Yer ve Hava", not: "Ateş Püskürtücü: Baktığı yöne doğru koni şeklinde yakıcı alev dalgaları gönderir.", ipucu: "Hava Patlatıcı gibi belirli bir yöne bakar; arka tarafından saldırmak çok daha güvenlidir.", gorsel: gorselYolu("Firespitter") },

  // KUŞATMA MAKİNELERİ (9 Kuşatma Makinesi - Açılış Sırasına Göre)
  { id: "siege-wall-wrecker", baslik: tr("Wall Wrecker"), tur: "Kuşatma", hedef: "Belediye Binası", not: "Tokmak: Önündeki tüm duvarları ezerek doğrudan Belediye Binasına ilerler.", ipucu: "Klan Kalesi birliklerini köyün tam merkezine kadar güvenle taşımak için kullanılır.", gorsel: gorselYolu("Wall Wrecker") },
  { id: "siege-battle-blimp", baslik: tr("Battle Blimp"), tur: "Kuşatma", hedef: "Belediye Binası", not: "Zeplin: Savunmaların üzerinden uçarak doğrudan Belediye Binasına gider.", ipucu: "İçine Yeti veya Süper Okçu koyarak merkezi güvenli şekilde patlat.", gorsel: gorselYolu("Battle Blimp") },
  { id: "siege-stone-slammer", baslik: tr("Stone Slammer"), tur: "Kuşatma", hedef: "Savunmalar", not: "Kaya Balonu: Havadan dev kayalar bırakarak savunmalara ve duvarlara alan hasarı verir.", ipucu: "Ejderha ve Balon saldırılarında savunma hattını kırmak için harikadır.", gorsel: gorselYolu("Stone Slammer") },
  { id: "siege-siege-barracks", baslik: tr("Siege Barracks"), tur: "Kuşatma", hedef: "Dış Alan", not: "Uçan Kışla: İndiği noktadan sırayla P.E.K.K.A ve Büyücüler çıkarır.", ipucu: "Kanat temizliği (funnel) yapmak ve ana ordunun dışarı kaçmasını önlemek için bırakılır.", gorsel: gorselYolu("Siege Barracks") },
  { id: "siege-log-launcher", baslik: tr("Log Launcher"), tur: "Kuşatma", hedef: "Belediye Binası", not: "Tomruk Fırlatıcı: İlerlerken önündeki tüm duvar ve binalara hasar veren kütükler fırlatır.", ipucu: "Kartal Topu veya Cehennem Kulesi hizasından bırakılarak iki hedef birden yıpratılır.", gorsel: gorselYolu("Log Launcher") },
  { id: "siege-flame-flinger", baslik: tr("Flame Flinger"), tur: "Kuşatma", hedef: "Savunmalar", not: "Alev Atıcı: Çok uzun menzilden ateş topları fırlatarak savunmaları yakar.", ipucu: "X Yayı ve Havan toplarının menziline dikkat edilerek boş bir köşeden bırakılır.", gorsel: gorselYolu("Flame Flinger") },
  { id: "siege-battle-drill", baslik: tr("Battle Drill"), tur: "Kuşatma", hedef: "Savunmalar", not: "Savaş Köstebeği: Yeraltından ilerleyerek savunmaların altında çıkar ve onları sersemletir.", ipucu: "Madenci ve Domuz Binici ordularıyla birlikte ilerlediğinde savunmaları kilitler.", gorsel: gorselYolu("Battle Drill") },
  { id: "siege-troop-launcher", baslik: tr("Troop Launcher"), tur: "Kuşatma", hedef: "Uzun Menzil", not: "Birlik Atıcı: Uzak mesafeden haritanın içine destek birlikleri ve variller fırlatır.", ipucu: "Ana ordu merkeze girdiğinde arkadan sürekli taze takviye göndermek için idealdir.", gorsel: gorselYolu("Troop Launcher") },
  { id: "siege-sky-wagon", baslik: tr("Sky Wagon"), tur: "Kuşatma", hedef: "Savunmalar", not: "Uçan Taşıyıcı: Havadan ilerleyerek hedef bölgeye birlik taşıyan ve destek sağlayan kuşatma aracı.", ipucu: "Koruma altına alındığında kritik bir bölgedeki savunmaları aşmak için kullanılır.", gorsel: gorselYolu("Sky Wagon") },
];

const BOLUMLER: { id: "Tümü" | Kategori; etiket: string; ikon: string }[] = [
  { id: "Tümü", etiket: "Tüm Bölümler", ikon: "📚" },
  { id: "Kahraman", etiket: "Kahramanlar", ikon: "👑" },
  { id: "Birlik", etiket: "Birlikler", ikon: "⚔️" },
  { id: "Takım Kışlası", etiket: "Takım Kışlası", ikon: "🪖" },
  { id: "Büyü", etiket: "Büyüler", ikon: "⚡" },
  { id: "Savunma", etiket: "Savunmalar", ikon: "🛡️" },
  { id: "Kuşatma", etiket: "Kuşatma Makineleri", ikon: "🚜" },
];

function RehberGorseli({ oge }: { oge: RehberOgesi }) {
  const [hata, setHata] = useState(!oge.gorsel);

  if (hata || !oge.gorsel) {
    return (
      <div
        style={{
          width: 54,
          height: 54,
          borderRadius: 12,
          flexShrink: 0,
          border: "1px solid var(--cizgi)",
          background: "var(--bg)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 24,
        }}
      >
        {oge.rozet ?? "⚔️"}
      </div>
    );
  }

  return (
    <img
      src={oge.gorsel}
      alt={oge.baslik}
      width={54}
      height={54}
      style={{
        borderRadius: 12,
        objectFit: "cover",
        flexShrink: 0,
        border: "1px solid var(--cizgi)",
        background: "var(--bg)",
      }}
      onError={() => setHata(true)}
    />
  );
}

export default function RehberSayfasi() {
  const [ara, setAra] = useState("");
  const [seciliBolum, setSeciliBolum] = useState<"Tümü" | Kategori>("Tümü");

  const sonuc = LISTE.filter(
    (x) =>
      (seciliBolum === "Tümü" || x.tur === seciliBolum) &&
      (x.baslik + " " + x.not + " " + x.ipucu)
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
            placeholder="Birlik, kahraman, takım kışlası, büyü, savunma veya taktik ara…"
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
              key={x.id}
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
              <RehberGorseli oge={x} />

              {/* Orta Bilgi (Başlık + Açıklama) */}
              <div style={{ flex: "1 1 280px", minWidth: 0 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap", marginBottom: 4 }}>
                  <strong style={{ fontSize: 17 }}>{x.baslik}</strong>
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