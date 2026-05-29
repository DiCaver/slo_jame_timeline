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
├── export-log.json
├── index.html
├── log-export.php
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
