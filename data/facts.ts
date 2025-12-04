
interface CategorizedFact {
    category: string;
    text: string;
}

export const FUN_FACTS_DATA: CategorizedFact[] = [
    // --- VESMÍR A FYZIKA ---
    { category: 'Vesmír', text: 'Neutrónová hviezda je taká hustá, že jedna lyžička jej hmoty by vážila 6 miliárd ton.' },
    { category: 'Vesmír', text: 'Svetlo zo Slnka, ktoré vidíš, je staré 8 minút a 20 sekúnd.' },
    { category: 'Vesmír', text: 'Na Venuši trvá jeden deň dlhšie ako jeden rok (otáča sa pomalšie, než obehne Slnko).' },
    { category: 'Vesmír', text: 'Vo vesmíre je úplné ticho, pretože tam nie je atmosféra na prenos zvukových vĺn.' },
    { category: 'Vesmír', text: 'Mliečna dráha sa pohybuje vesmírom rýchlosťou 2,1 milióna km/h.' },
    { category: 'Vesmír', text: 'Keby si mohol zložiť list papiera 42-krát, dosiahol by až na Mesiac.' },
    { category: 'Vesmír', text: 'Väčšina atómu je prázdny priestor. Keby sme ho odstránili, celé ľudstvo by sa zmestilo do kocky cukru.' },
    { category: 'Vesmír', text: 'Najchladnejšie známe miesto vo vesmíre (Hmlovina Bumerang) má teplotu -272°C.' },
    { category: 'Vesmír', text: 'Na Marse je sopka Olympus Mons, ktorá je trikrát vyššia ako Mount Everest.' },
    { category: 'Vesmír', text: 'Jupiterov Mesiac Io je vulkanicky najaktívnejšie teleso v slnečnej sústave.' },
    { category: 'Vesmír', text: 'Slnko tvorí 99,86 % hmotnosti celej slnečnej sústavy.' },
    { category: 'Vesmír', text: 'Existujú planéty (tzv. túlavé planéty), ktoré neobiehajú okolo žiadnej hviezdy a letia tmou.' },
    { category: 'Vesmír', text: 'Ak by si spadol do čiernej diery, čas by sa pre teba spomalil takmer na nulu.' },
    { category: 'Vesmír', text: 'Voyager 1 je najvzdialenejší objekt vytvorený človekom, letí už viac ako 45 rokov.' },
    { category: 'Vesmír', text: 'Voda bola na Zemi prítomná skôr, ako vzniklo samotné Slnko.' },
    
    // --- HISTÓRIA A CIVILIZÁCIE ---
    { category: 'História', text: 'Univerzita v Oxforde je staršia ako Ríša Aztékov.' },
    { category: 'História', text: 'Kleopatra žila časovo bližšie k pristátiu na Mesiaci než k stavbe pyramíd v Gíze.' },
    { category: 'História', text: 'V starovekom Ríme používali moč na bielenie zubov (kvôli amoniaku).' },
    { category: 'História', text: 'Najkratšia vojna v histórii trvala 38 minút (Zanzibar vs. Británia, 1896).' },
    { category: 'História', text: 'Hrdina Napoleon Bonaparte nebol v skutočnosti nízky, mal priemernú výšku svojej doby.' },
    { category: 'História', text: 'Mamuty vyhynuli až 1000 rokov po tom, čo boli postavené pyramídy.' },
    { category: 'História', text: 'Viktoriánski ľudia sa na fotkách neusmievali, lebo expozícia trvala príliš dlho.' },
    { category: 'História', text: 'Kečup sa v 19. storočí v USA predával ako liek na tráviace ťažkosti.' },
    { category: 'História', text: 'Antickí Gréci nepoznali slovo pre modrú farbu (More opisovali ako "farbu vína").' },
    { category: 'História', text: 'Veľký čínsky múr nie je viditeľný z vesmíru voľným okom (je príliš úzky).' },
    { category: 'História', text: 'Prvý budík, ktorý vynájdu v roku 1787, mohol zazvoniť len o 4:00 ráno.' },
    { category: 'História', text: 'V 17. storočí boli tulipány v Holandsku drahšie ako domy (Tulipánová horúčka).' },
    { category: 'História', text: 'Rimania používali na čistenie riadu piesok a olej.' },
    { category: 'História', text: 'Pôvodný názov New Yorku bol Nový Amsterdam.' },
    { category: 'História', text: 'V stredoveku verili, že paradajky sú jedovaté (kvôli oloveným tanierom, ktoré reagovali s kyselinou).' },

    // --- PRÍRODA A BIOLÓGIA ---
    { category: 'Príroda', text: 'Medúza Turritopsis dohrnii je biologicky nesmrteľná (vie vrátiť svoj cyklus späť).' },
    { category: 'Príroda', text: 'Chobotnice majú tri srdcia a modrú krv.' },
    { category: 'Príroda', text: 'Banány sú z botanického hľadiska bobule, ale jahody nie.' },
    { category: 'Príroda', text: 'Žraloky existovali na Zemi skôr ako stromy.' },
    { category: 'Príroda', text: 'Med sa nikdy nepokazí. Našiel sa v egyptských hrobkách a bol stále jedlý.' },
    { category: 'Príroda', text: 'Stromy medzi sebou komunikujú a zdieľajú živiny cez podzemnú sieť húb (Wood Wide Web).' },
    { category: 'Príroda', text: 'Kravy majú najlepšie kamarátky a prežívajú stres, keď ich rozdelia.' },
    { category: 'Príroda', text: 'Voda vriaca v hlbokom oceáne môže mať 400°C a stále byť tekutá kvôli tlaku.' },
    { category: 'Príroda', text: 'Koaly majú odtlačky prstov takmer identické s ľudskými.' },
    { category: 'Príroda', text: 'Veveričky neúmyselne vysadia milióny stromov, lebo zabudnú, kam skryli orechy.' },
    { category: 'Príroda', text: 'Huby sú geneticky bližšie k zvieratám ako k rastlinám.' },
    { category: 'Príroda', text: 'Niektoré korytnačky dokážu dýchať zadkom (kloakálna respirácia) počas zimného spánku.' },
    { category: 'Príroda', text: 'Panda strávi 12 hodín denne jedením bambusu.' },
    { category: 'Príroda', text: 'Modrá veľryba má srdce veľké ako malé auto.' },
    { category: 'Príroda', text: 'Plameniaky sú ružové len kvôli strave (krevety a riasy).' },

    // --- TECH A BUDÚCNOSŤ ---
    { category: 'Tech', text: 'Prvý počítačový vírus (Creeper) vznikol už v roku 1971.' },
    { category: 'Tech', text: 'Výpočtový výkon smartfónu je miliónkrát väčší ako počítača Apollo 11.' },
    { category: 'Tech', text: 'Viac ako 90 % svetových peňazí existuje len v digitálnej forme.' },
    { category: 'Tech', text: 'Prvá webkamera na svete vznikla, aby vedci videli, či je v kanvici káva.' },
    { category: 'Tech', text: 'Slovo "robot" vymyslel český spisovateľ Karel Čapek (znamená "práca").' },
    { category: 'Tech', text: 'Internet váži približne toľko ako jedna jahoda (hmotnosť všetkých elektrónov dát).' },
    { category: 'Tech', text: 'QWERTY klávesnica bola navrhnutá tak, aby spomalila písanie a nezasekávali sa stroje.' },
    { category: 'Tech', text: 'Prvé logo Apple zobrazovalo Isaaca Newtona pod stromom.' },
    { category: 'Tech', text: 'Každú minútu sa na YouTube nahrá viac ako 500 hodín videa.' },
    { category: 'Tech', text: 'Prvá SMS správa bola odoslaná v roku 1992 a znela "Merry Christmas".' },
    { category: 'Tech', text: 'Nórsko ukladá zálohu všetkých semien sveta v trezore na Špicbergoch pre prípad apokalypsy.' },
    { category: 'Tech', text: 'Grafén je materiál, ktorý je 200-krát pevnejší ako oceľ, ale ľahší ako papier.' },
    { category: 'Tech', text: 'Umelá inteligencia dokáže dnes vyhrať nad človekom v šachu, Go, aj v pokri.' },
    { category: 'Tech', text: 'Prvý 1 GB pevný disk (1980) vážil viac ako 250 kg a stál 40 000 dolárov.' },
    { category: 'Tech', text: 'Wikipedia obsahuje viac slov, než by človek prečítal za 150 životov.' },

    // --- PSYCHOLÓGIA A ĽUDSTVO ---
    { category: 'Psychológia', text: 'Placebo efekt funguje, aj keď viete, že beriete placebo.' },
    { category: 'Psychológia', text: 'Ľudia sú jediný živočíšny druh, ktorý sa červená od hanby.' },
    { category: 'Psychológia', text: 'Čítanie kníh môže predĺžiť život o 2 roky vďaka kognitívnej stimulácii.' },
    { category: 'Psychológia', text: 'Deja Vu je pravdepodobne len "chyba v matici" pamäte, kedy mozog zapíše vnem rovno do dlhodobej pamäte.' },
    { category: 'Psychológia', text: 'Hudba dokáže synchronizovať tlkot srdca s rytmom skladby.' },
    { category: 'Psychológia', text: 'Rozhodovacia únava je dôvod, prečo Steve Jobs nosil stále to isté oblečenie.' },
    { category: 'Psychológia', text: 'Väčšina spomienok z detstva pred 3. rokom života sú falošné konštrukcie.' },
    { category: 'Psychológia', text: 'Smiech je nákazlivý, pretože náš mozog automaticky zrkadlí emócie iných.' },
    { category: 'Psychológia', text: 'Ľudské oko dokáže rozoznať 10 miliónov rôznych farieb.' },
    { category: 'Psychológia', text: 'Multitasking neexistuje. Mozog len rýchlo prepína pozornosť, čo znižuje IQ.' },
    { category: 'Psychológia', text: 'Keď spíte v novom prostredí, jedna hemisféra mozgu ostáva čiastočne bdelá (efekt prvej noci).' },
    { category: 'Psychológia', text: 'Vôňa je zmysel najsilnejšie prepojený s pamäťou a emóciami.' },
    { category: 'Psychológia', text: 'Objatie dlhšie ako 20 sekúnd uvoľňuje oxytocín a znižuje stres.' },
    { category: 'Psychológia', text: 'Fóbia z dlhých slov sa volá hippopotomonstrosesquippedaliophobia.' },
    { category: 'Psychológia', text: 'Mozog ignoruje nos vo vašom zornom poli, aby vás nerušil.' }
];
