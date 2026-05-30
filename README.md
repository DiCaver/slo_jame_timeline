# Časovni zemljevid jam

### Interaktivni časovni zemljevid registriranih jam v Sloveniji.

Projekt prikazuje razvoj registriranih jam skozi čas z uporabo OpenLayers, GeoJSON in vanilla JavaScript. Uporabnik lahko raziskuje lokacije jam po datumu, predvaja časovnico, uporablja različne vizualne načine prikaza ter izvozi slike ali video animacije.


## Funkcionalnosti

* Interaktivni zemljevid Slovenije
* Časovnica registriranih jam
* Predvajanje animacije skozi čas
* Nastavljiva hitrost animacije
* Prikaz:
  * točk
  * toplotnega prikaza (heatmap)
  * kombiniranega načina
* Več podlag:
  * OpenStreetMap
  * ortofoto
  * hibridni prikaz
* Maska »Samo Slovenija«
* Nastavitve:
  * velikost točk
  * obroba
  * barve
  * prosojnost
  * slog logotipa
  * slog in prosojnost letnice
* Izvoz:
  * PNG slike
  * WEBM video animacije
* Dvojezični uporabniški vmesnik:
  * slovenščina
  * angleščina

## Tehnologije

Projekt uporablja:

* HTML5
* CSS3
* Vanilla JavaScript
* OpenLayers
* GeoJSON
* Python (za pretvorbo Excel podatkov - *ni del tega repozitorija*)

## Struktura projekta

```text
/
├── css/
│   └── style.css
│
├── data/
│   ├── caves.geojson
│   ├── caves.xls (ni del tega repozitorija)
│   └── slovenia-mask.geojson
│
├── img/
│   ├── drp_logo_small_b.png
│   └── drp_logo_small_w.png
│
├── js/
│   ├── app.js
│   └── translations.js
│
├── excel_to_geojson.py (ni del tega repozitorija)
├── export-log.json (ustvari se samodejno ob prvi uporabi)
├── index.html
├── log-export.php (ni potreben za lokalni ogled)
└── README.md
```

## Podatki

Projekt uporablja podatke registra jam (JZS), izvožene iz Excel datoteke v GeoJSON format.

Python skripta omogoča (*ni del tega repozitorija*):
* branje Excel datoteke
* izbiro ustreznega datuma:
  1. Datum ekskurzije (*if NULL*)
  2. Datum zapisnika (*if NULL*)
  3. Datum vnosa
* izvoz GeoJSON datoteke za spletni prikaz

## Zagon projekta

Ker projekt uporablja `fetch()` za nalaganje GeoJSON datotek, ga je potrebno zagnati preko lokalnega strežnika.

Primer z Visual Studio Code:
1. Namesti razširitev:
   * Live Server
2. Desni klik na:
   * `index.html`
3. Izberi:
   * `Open with Live Server`

Opomba: beleženje statistike uporabe (`log-export.php`) deluje samo na strežniku s podporo za PHP. Pri uporabi VS Code Live Server razširitve beleženje ni na voljo.

## Izvoz

### Izvoz slike

Trenutni pogled zemljevida je mogoče izvoziti kot PNG sliko.

Izvoz vključuje:
* zemljevid
* točke
* heatmap
* letnico (*omogoča vklop/izklop*)
* logotip (*omogoča vklop/izklop*)

### Izvoz videa

Možen je izvoz časovne animacije v `.webm` format.

Video vključuje:
* trenutno podlago
* heatmap / točke
* letnico (*omogoča vklop/izklop*)
* logotip (*omogoča vklop/izklop*)
* trenutne vizualne nastavitve

## Statistika uporabe

Projekt vključuje preprost sistem beleženja uporabe, ki temelji na PHP skripti `log-export.php` in datoteki `export-log.json`.

Beležijo se naslednji dogodki:

* število zagonov animacije (*Play*)
* število izvozov slik (*PNG*)
* število izvozov videov (*WEBM*)

Ob zagonu animacije se dodatno beležijo tudi izbrane nastavitve uporabnika:

* način prikaza:

  * točke
  * heatmap
  * oboje
* korak animacije (leta)
* hitrost animacije
* izbrana podlaga:

  * OpenStreetMap
  * ortofoto
  * hibridni prikaz
* izbran jezik uporabniškega vmesnika

Podatki se ne beležijo na ravni posameznega uporabnika in ne vsebujejo osebnih podatkov. Namen beleženja je zgolj pridobiti osnovno statistiko uporabe ter ugotoviti, katere funkcionalnosti in nastavitve obiskovalci najpogosteje uporabljajo.

Primer datoteke `export-log.json`:

```json
{
  "play": 1234,
  "image": 56,
  "video": 12,

  "languages": {
    "sl": 1180,
    "en": 54
  },

  "play_settings": {
    "mode=both|years=5|per=250|layer=hybrid": 412,
    "mode=heatmap|years=1|per=1000|layer=ortho": 198,
    "mode=dots|years=10|per=500|layer=osm": 87
  }
}
```


## Avtor

**Marko Zakrajšek**

E-pošta:
[marko@zakrajsek.org](mailto:marko@zakrajsek.org)

GitHub:
https://github.com/DiCaver/slo_jame_timeline

## Zahvale

* OpenStreetMap contributors
* Esri
* Jamarska zveza Slovenije - Kataster

## Licenca

Projekt je odprtokoden in namenjen raziskovanju, vizualizaciji ter promociji jamarske dediščine Slovenije.
