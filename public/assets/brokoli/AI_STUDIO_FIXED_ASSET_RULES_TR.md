# AI STUDIO — BROKOLİ KAHRAMAN FIXED ASSET RULES

Bu asset paketi temizlenmiş son sürümdür. Oyunun görsellerini üretirken bu klasördeki PNG dosyaları kaynak gerçeklik olarak kullanılmalıdır.

## ZORUNLU

1. `public/assets/brokoli/02_characters/` içindeki karakter PNG'lerini aynen kullan.
2. Karakterleri yeniden çizme, yeniden üretme veya basitleştirme.
3. CSS şekilleri, SVG karakterler, emoji, placeholder ve yeni AI karakterleri kullanma.
4. `brokoli_kahraman.png`, `havuc_kiz_arkadas.png`, `domates_dost.png`, `misir_dost.png`, `sogan_dost.png`, `biber_dost.png`, `patlican_dost.png`, `bezelye_dost.png`, `mantar_dost.png`, `salatalik_dost.png` dosyaları ayrı oyun assetleridir.
5. `03_enemies_bosses/` altındaki Ketçap, Hardal, Mayonez ve Hamburger Kral dosyalarını aynen kullan.
6. PNG'leri oyun içine yerleştirirken aspect ratio'yu bozma.
7. Transparent PNG'lerin çevresine yeni renkli kutu veya arka plan ekleme.
8. Dosya isimlerini değiştirme.
9. `08_reference/MASTER_ASSET_ATLAS.png` sadece referanstır; runtime'da atlas olarak kullanmak zorunda değilsin.

## OYUN YAPISI

Oyun 2D platform macerası olabilir. Görsel kalite düşmeyecek.

Karakterleri hareket ettirmek için aynı PNG'yi:
- position
- scale
- rotation
- squash/stretch
- flipX
- tween

ile canlandırabilirsin.

Yeni karakter sprite'ı üretme.

## ASSET YOLLARI

public/assets/brokoli/01_brand/
public/assets/brokoli/02_characters/
public/assets/brokoli/03_enemies_bosses/
public/assets/brokoli/04_worlds/
public/assets/brokoli/05_environment/
public/assets/brokoli/06_levels/
public/assets/brokoli/07_ui/
public/assets/brokoli/08_reference/

## BAŞLAMADAN ÖNCE

Önce bütün PNG dosyalarını tara ve bir runtime asset manifest oluştur.

Her dosyanın:
- path
- width
- height
- purpose

bilgisini kaydet.

Bir karakter dosyası okunabiliyorsa onu tekrar çizmek yasaktır.

## GÖRSEL HEDEF

Oyunun görsel kalitesi:
- parlak
- temiz
- renkli
- yüksek kaliteli 3D-cartoon render görselleriyle çalışan 2D platform sunumu
- çocuk dostu
- tutarlı

olmalı.

Özellikle Brokoli Kahraman'ın mevcut tasarımını değiştirme.

## ÖNEMLİ KONTROL

Oyunun ilk preview'sinde:

Brokoli
Havuç
Ketçap
Hardal
Mayonez
Hamburger Kral

karakterlerini ekranda tek tek göster.

Karakterlerin görselleri asset paketindeki PNG'lerle birebir aynı dosyalar olmalı.

Brokoli farklı görünüyorsa bunu hata kabul et ve asset yolunu düzelt.
