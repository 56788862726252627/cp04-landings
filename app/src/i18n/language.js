import { useEffect, useState } from "react";

// Shared locale selection state. Persists only cp04_language and not user data.
function normalizeSearchText(value) {
  if (value == null) return "";
  return String(value).toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim();
}

export const LANGUAGES_RAW = [
  // Recomendados (padel/sport/reservas context)
  { code: "es-ES", label: "Español", country: "España", countryEs: "España", countryEn: "Spain", flag: "🇪🇸", recommended: true, aliases: ["España","Spain","Español","Spanish","Castellano","ES","es","es-ES","🇪🇸","espana","spain","español","spanish","castellano"] },
  { code: "en-GB", label: "English", country: "United Kingdom", countryEs: "Reino Unido", countryEn: "United Kingdom", flag: "🇬🇧", recommended: true, aliases: ["English","Inglés","United Kingdom","Reino Unido","Great Britain","Britain","UK","GB","en","en-GB","🇬🇧","ingles","united kingdom","reino unido"] },
  { code: "fr-FR", label: "Français", country: "France", countryEs: "Francia", countryEn: "France", flag: "🇫🇷", recommended: true, aliases: ["Français","Francés","French","France","Francia","FR","fr","fr-FR","🇫🇷","francais","frances","french","france","francia"] },
  { code: "de-DE", label: "Deutsch", country: "Deutschland", countryEs: "Alemania", countryEn: "Germany", flag: "🇩🇪", recommended: true, aliases: ["Deutsch","Alemán","German","Deutschland","Alemania","Germany","DE","de","de-DE","🇩🇪","aleman","german","alemania","deutschland"] },
  { code: "it-IT", label: "Italiano", country: "Italia", countryEs: "Italia", countryEn: "Italy", flag: "🇮🇹", recommended: true, aliases: ["Italiano","Italian","Italia","Italy","IT","it","it-IT","🇮🇹","italiano","italian","italia","italy"] },
  { code: "pt-PT", label: "Português", country: "Portugal", countryEs: "Portugal", countryEn: "Portugal", flag: "🇵🇹", recommended: true, aliases: ["Português","Portugués","Portuguese","Portugal","PT","pt","pt-PT","🇵🇹","portugues","portuguese","portugal"] },
  { code: "pt-BR", label: "Português", country: "Brasil", countryEs: "Brasil", countryEn: "Brazil", flag: "🇧🇷", recommended: true, aliases: ["Português","Portugués","Portuguese","Brasil","Brazil","BR","pt-BR","🇧🇷","portugues","portuguese","brasil","brazil"] },
  { code: "nl-NL", label: "Nederlands", country: "Nederland", countryEs: "Países Bajos", countryEn: "Netherlands", flag: "🇳🇱", recommended: true, aliases: ["Nederlands","Neerlandés","Dutch","Nederland","Países Bajos","Netherlands","NL","nl","nl-NL","🇳🇱","neerlandes","dutch","paises bajos","netherlands","nederland"] },
  { code: "ru-RU", label: "Русский", country: "Россия", countryEs: "Rusia", countryEn: "Russia", flag: "🇷🇺", recommended: false, aliases: ["Русский","Ruso","Russian","Россия","Rusia","Russia","RU","ru","ru-RU","🇷🇺","ruso","russian","rusia","russia"] },
  { code: "ar-SA", label: "العربية", country: "السعودية", countryEs: "Arabia Saudí", countryEn: "Saudi Arabia", flag: "🇸🇦", recommended: false, aliases: ["العربية","Árabe","Arabic","السعودية","Arabia Saudí","Saudi Arabia","AR","ar","ar-SA","🇸🇦","arabe","arabic","arabia saudi","saudi arabia"] },
  // All 100 languages/variants
  { code: "af-ZA", label: "Afrikaans", country: "South Africa", countryEs: "Sudáfrica", countryEn: "South Africa", flag: "🇿🇦", recommended: false, aliases: ["Afrikaans","South Africa","Sudáfrica","ZA","af","af-ZA","🇿🇦","sudafrica","south africa"] },
  { code: "sq-AL", label: "Shqip", country: "Shqipëri", countryEs: "Albania", countryEn: "Albania", flag: "🇦🇱", recommended: false, aliases: ["Shqip","Albanés","Albanian","Shqipëri","Albania","AL","sq","sq-AL","🇦🇱","albanes","albanian","albania"] },
  { code: "am-ET", label: "አማርኛ", country: "ኢትዮጵያ", countryEs: "Etiopía", countryEn: "Ethiopia", flag: "🇪🇹", recommended: false, aliases: ["አማርኛ","Amhárico","Amharic","ኢትዮጵያ","Etiopía","Ethiopia","ET","am","am-ET","🇪🇹","amharico","amharic","etiopia","ethiopia"] },
  { code: "ar-EG", label: "العربية", country: "مصر", countryEs: "Egipto", countryEn: "Egypt", flag: "🇪🇬", recommended: false, aliases: ["العربية","Árabe","Arabic","مصر","Egipto","Egypt","EG","ar-EG","🇪🇬","arabe","arabic","egipto","egypt"] },
  { code: "ar-MA", label: "العربية", country: "المغرب", countryEs: "Marruecos", countryEn: "Morocco", flag: "🇲🇦", recommended: false, aliases: ["العربية","Árabe","Arabic","المغرب","Marruecos","Morocco","MA","ar-MA","🇲🇦","arabe","arabic","marruecos","morocco"] },
  { code: "hy-AM", label: "Հայերեն", country: "Հայաստան", countryEs: "Armenia", countryEn: "Armenia", flag: "🇦🇲", recommended: false, aliases: ["Հայերեն","Armenio","Armenian","Հայաստան","Armenia","AM","hy","hy-AM","🇦🇲","armenio","armenian","armenia"] },
  { code: "az-AZ", label: "Azərbaycan", country: "Azərbaycan", countryEs: "Azerbaiyán", countryEn: "Azerbaijan", flag: "🇦🇿", recommended: false, aliases: ["Azərbaycan","Azerbaiyano","Azerbaijani","Azerbaiyán","Azerbaijan","AZ","az","az-AZ","🇦🇿","azerbaiyano","azerbaijani","azerbaiyan","azerbaijan"] },
  { code: "eu-ES", label: "Euskara", country: "Euskal Herria", countryEs: "País Vasco", countryEn: "Basque Country", flag: "🏴", recommended: false, aliases: ["Euskara","Vasco","Basque","Euskal Herria","País Vasco","Basque Country","eu","eu-ES","🏴","vasco","basque","pais vasco"] },
  { code: "be-BY", label: "Беларуская", country: "Беларусь", countryEs: "Bielorrusia", countryEn: "Belarus", flag: "🇧🇾", recommended: false, aliases: ["Беларуская","Bielorruso","Belarusian","Беларусь","Bielorrusia","Belarus","BY","be","be-BY","🇧🇾","bielorruso","belarusian","bielorrusia","belarus"] },
  { code: "bn-BD", label: "বাংলা", country: "বাংলাদেশ", countryEs: "Bangladés", countryEn: "Bangladesh", flag: "🇧🇩", recommended: false, aliases: ["বাংলা","Bengalí","Bengali","বাংলাদেশ","Bangladés","Bangladesh","BD","bn","bn-BD","🇧🇩","bengali","bangla","bangladesh"] },
  { code: "bs-BA", label: "Bosanski", country: "Bosna i Hercegovina", countryEs: "Bosnia y Herzegovina", countryEn: "Bosnia and Herzegovina", flag: "🇧🇦", recommended: false, aliases: ["Bosanski","Bosnio","Bosnian","Bosna i Hercegovina","Bosnia y Herzegovina","Bosnia and Herzegovina","BA","bs","bs-BA","🇧🇦","bosnio","bosnian","bosnia"] },
  { code: "bg-BG", label: "Български", country: "България", countryEs: "Bulgaria", countryEn: "Bulgaria", flag: "🇧🇬", recommended: false, aliases: ["Български","Búlgaro","Bulgarian","България","Bulgaria","BG","bg","bg-BG","🇧🇬","bulgaro","bulgarian","bulgaria"] },
  { code: "ca-ES", label: "Català", country: "Catalunya", countryEs: "Cataluña", countryEn: "Catalonia", flag: "🏴", recommended: false, aliases: ["Català","Catalán","Catalan","Catalunya","Cataluña","Catalonia","ca","ca-ES","🏴","catalan","catalunya","cataluna","catalonia"] },
  { code: "zh-CN", label: "中文", country: "中国", countryEs: "China", countryEn: "China (Simplified)", flag: "🇨🇳", recommended: false, aliases: ["中文","Chino","Chinese","中国","China","Simplified Chinese","ZH","zh","zh-CN","🇨🇳","chino","chinese","china"] },
  { code: "zh-TW", label: "中文", country: "台灣", countryEs: "Taiwán", countryEn: "Taiwan (Traditional)", flag: "🇹🇼", recommended: false, aliases: ["中文","Chino","Chinese","台灣","Taiwán","Taiwan","Traditional Chinese","zh-TW","🇹🇼","taiwan","taiwán"] },
  { code: "hr-HR", label: "Hrvatski", country: "Hrvatska", countryEs: "Croacia", countryEn: "Croatia", flag: "🇭🇷", recommended: false, aliases: ["Hrvatski","Croata","Croatian","Hrvatska","Croacia","Croatia","HR","hr","hr-HR","🇭🇷","croata","croatian","croacia","croatia"] },
  { code: "cs-CZ", label: "Čeština", country: "Česká republika", countryEs: "República Checa", countryEn: "Czech Republic", flag: "🇨🇿", recommended: false, aliases: ["Čeština","Checo","Czech","Česká republika","República Checa","Czech Republic","CZ","cs","cs-CZ","🇨🇿","checo","czech","republica checa"] },
  { code: "da-DK", label: "Dansk", country: "Danmark", countryEs: "Dinamarca", countryEn: "Denmark", flag: "🇩🇰", recommended: false, aliases: ["Dansk","Danés","Danish","Danmark","Dinamarca","Denmark","DK","da","da-DK","🇩🇰","danes","danish","dinamarca","denmark"] },
  { code: "nl-BE", label: "Nederlands", country: "België", countryEs: "Bélgica", countryEn: "Belgium (Dutch)", flag: "🇧🇪", recommended: false, aliases: ["Nederlands","Neerlandés","Dutch","België","Bélgica","Belgium","BE","nl-BE","🇧🇪","belgica","belgium"] },
  { code: "en-AU", label: "English", country: "Australia", countryEs: "Australia", countryEn: "Australia", flag: "🇦🇺", recommended: false, aliases: ["English","Inglés","Australia","AU","en-AU","🇦🇺","ingles","australia"] },
  { code: "en-CA", label: "English", country: "Canada", countryEs: "Canadá", countryEn: "Canada", flag: "🇨🇦", recommended: false, aliases: ["English","Inglés","Canada","Canadá","CA","en-CA","🇨🇦","canada","ingles"] },
  { code: "en-IN", label: "English", country: "India", countryEs: "India", countryEn: "India", flag: "🇮🇳", recommended: false, aliases: ["English","Inglés","India","IN","en-IN","🇮🇳","india","ingles"] },
  { code: "en-NZ", label: "English", country: "New Zealand", countryEs: "Nueva Zelanda", countryEn: "New Zealand", flag: "🇳🇿", recommended: false, aliases: ["English","Inglés","New Zealand","Nueva Zelanda","NZ","en-NZ","🇳🇿","nueva zelanda","new zealand"] },
  { code: "en-US", label: "English", country: "United States", countryEs: "Estados Unidos", countryEn: "United States", flag: "🇺🇸", recommended: false, aliases: ["English","Inglés","United States","Estados Unidos","USA","US","en-US","en","🇺🇸","estados unidos","united states"] },
  { code: "et-EE", label: "Eesti", country: "Eesti", countryEs: "Estonia", countryEn: "Estonia", flag: "🇪🇪", recommended: false, aliases: ["Eesti","Estonio","Estonian","Estonia","EE","et","et-EE","🇪🇪","estonio","estonian","estonia"] },
  { code: "fo-FO", label: "Føroyskt", country: "Færøerne", countryEs: "Islas Feroe", countryEn: "Faroe Islands", flag: "🇫🇴", recommended: false, aliases: ["Føroyskt","Feroés","Faroese","Færøerne","Islas Feroe","Faroe Islands","FO","fo","fo-FO","🇫🇴","feroes","faroese","islas feroe"] },
  { code: "fi-FI", label: "Suomi", country: "Suomi", countryEs: "Finlandia", countryEn: "Finland", flag: "🇫🇮", recommended: false, aliases: ["Suomi","Finlandés","Finnish","Finlandia","Finland","FI","fi","fi-FI","🇫🇮","finlandes","finnish","finlandia","finland"] },
  { code: "fr-BE", label: "Français", country: "Belgique", countryEs: "Bélgica (francés)", countryEn: "Belgium (French)", flag: "🇧🇪", recommended: false, aliases: ["Français","Francés","French","Belgique","Bélgica","Belgium","fr-BE","🇧🇪","frances","french","belgica"] },
  { code: "fr-CA", label: "Français", country: "Canada", countryEs: "Canadá (francés)", countryEn: "Canada (French)", flag: "🇨🇦", recommended: false, aliases: ["Français","Francés","French","Canada","Canadá","fr-CA","🇨🇦","frances","french","canada"] },
  { code: "fr-CH", label: "Français", country: "Suisse", countryEs: "Suiza (francés)", countryEn: "Switzerland (French)", flag: "🇨🇭", recommended: false, aliases: ["Français","Francés","French","Suisse","Suiza","Switzerland","fr-CH","🇨🇭","frances","french","suiza","switzerland"] },
  { code: "gl-ES", label: "Galego", country: "Galicia", countryEs: "Galicia", countryEn: "Galicia", flag: "🏴", recommended: false, aliases: ["Galego","Gallego","Galician","Galicia","gl","gl-ES","🏴","gallego","galician","galicia"] },
  { code: "ka-GE", label: "ქართული", country: "საქართველო", countryEs: "Georgia", countryEn: "Georgia", flag: "🇬🇪", recommended: false, aliases: ["ქართული","Georgiano","Georgian","საქართველო","Georgia","GE","ka","ka-GE","🇬🇪","georgiano","georgian","georgia"] },
  { code: "de-AT", label: "Deutsch", country: "Österreich", countryEs: "Austria", countryEn: "Austria", flag: "🇦🇹", recommended: false, aliases: ["Deutsch","Alemán","German","Österreich","Austria","AT","de-AT","🇦🇹","aleman","german","austria"] },
  { code: "de-CH", label: "Deutsch", country: "Schweiz", countryEs: "Suiza (alemán)", countryEn: "Switzerland (German)", flag: "🇨🇭", recommended: false, aliases: ["Deutsch","Alemán","German","Schweiz","Suiza","Switzerland","de-CH","🇨🇭","aleman","german","suiza"] },
  { code: "el-GR", label: "Ελληνικά", country: "Ελλάδα", countryEs: "Grecia", countryEn: "Greece", flag: "🇬🇷", recommended: false, aliases: ["Ελληνικά","Griego","Greek","Ελλάδα","Grecia","Greece","GR","el","el-GR","🇬🇷","griego","greek","grecia","greece"] },
  { code: "gu-IN", label: "ગુજરાતી", country: "India", countryEs: "India (gujarati)", countryEn: "India (Gujarati)", flag: "🇮🇳", recommended: false, aliases: ["ગુજરાતી","Gujarati","India","gu","gu-IN","🇮🇳","gujarati","india"] },
  { code: "he-IL", label: "עברית", country: "ישראל", countryEs: "Israel", countryEn: "Israel", flag: "🇮🇱", recommended: false, aliases: ["עברית","Hebreo","Hebrew","ישראל","Israel","IL","he","he-IL","🇮🇱","hebreo","hebrew","israel"] },
  { code: "hi-IN", label: "हिन्दी", country: "भारत", countryEs: "India (hindi)", countryEn: "India (Hindi)", flag: "🇮🇳", recommended: false, aliases: ["हिन्दी","Hindi","भारत","India","hi","hi-IN","🇮🇳","hindi","india"] },
  { code: "hu-HU", label: "Magyar", country: "Magyarország", countryEs: "Hungría", countryEn: "Hungary", flag: "🇭🇺", recommended: false, aliases: ["Magyar","Húngaro","Hungarian","Magyarország","Hungría","Hungary","HU","hu","hu-HU","🇭🇺","hungaro","hungarian","hungria","hungary"] },
  { code: "is-IS", label: "Íslenska", country: "Ísland", countryEs: "Islandia", countryEn: "Iceland", flag: "🇮🇸", recommended: false, aliases: ["Íslenska","Islandés","Icelandic","Ísland","Islandia","Iceland","IS","is","is-IS","🇮🇸","islandes","icelandic","islandia","iceland"] },
  { code: "id-ID", label: "Bahasa Indonesia", country: "Indonesia", countryEs: "Indonesia", countryEn: "Indonesia", flag: "🇮🇩", recommended: false, aliases: ["Bahasa Indonesia","Indonesio","Indonesian","Indonesia","ID","id","id-ID","🇮🇩","indonesio","indonesian","indonesia"] },
  { code: "ga-IE", label: "Gaeilge", country: "Éire", countryEs: "Irlanda", countryEn: "Ireland", flag: "🇮🇪", recommended: false, aliases: ["Gaeilge","Irlandés","Irish","Éire","Irlanda","Ireland","IE","ga","ga-IE","🇮🇪","irlandes","irish","irlanda","ireland"] },
  { code: "xh-ZA", label: "isiXhosa", country: "South Africa", countryEs: "Sudáfrica", countryEn: "South Africa", flag: "🇿🇦", recommended: false, aliases: ["isiXhosa","Xhosa","South Africa","Sudáfrica","xh","xh-ZA","🇿🇦","xhosa","sudafrica"] },
  { code: "zu-ZA", label: "isiZulu", country: "South Africa", countryEs: "Sudáfrica", countryEn: "South Africa", flag: "🇿🇦", recommended: false, aliases: ["isiZulu","Zulú","Zulu","South Africa","Sudáfrica","zu","zu-ZA","🇿🇦","zulu","sudafrica"] },
  { code: "ja-JP", label: "日本語", country: "日本", countryEs: "Japón", countryEn: "Japan", flag: "🇯🇵", recommended: false, aliases: ["日本語","Japonés","Japanese","日本","Japón","Japan","JP","ja","ja-JP","🇯🇵","japones","japanese","japon","japan"] },
  { code: "kn-IN", label: "ಕನ್ನಡ", country: "India", countryEs: "India (kannada)", countryEn: "India (Kannada)", flag: "🇮🇳", recommended: false, aliases: ["ಕನ್ನಡ","Kannada","India","kn","kn-IN","🇮🇳","kannada","india"] },
  { code: "kk-KZ", label: "Қазақ тілі", country: "Қазақстан", countryEs: "Kazajistán", countryEn: "Kazakhstan", flag: "🇰🇿", recommended: false, aliases: ["Қазақ тілі","Kazajo","Kazakh","Қазақстан","Kazajistán","Kazakhstan","KZ","kk","kk-KZ","🇰🇿","kazajo","kazakh","kazajistan","kazakhstan"] },
  { code: "km-KH", label: "ខ្មែរ", country: "កម្ពុជា", countryEs: "Camboya", countryEn: "Cambodia", flag: "🇰🇭", recommended: false, aliases: ["ខ្មែរ","Jemer","Khmer","កម្ពុជា","Camboya","Cambodia","KH","km","km-KH","🇰🇭","jemer","khmer","camboya","cambodia"] },
  { code: "ko-KR", label: "한국어", country: "대한민국", countryEs: "Corea del Sur", countryEn: "South Korea", flag: "🇰🇷", recommended: false, aliases: ["한국어","Coreano","Korean","대한민국","Corea del Sur","South Korea","KR","ko","ko-KR","🇰🇷","coreano","korean","corea del sur","south korea"] },
  { code: "ky-KG", label: "Кыргызча", country: "Кыргызстан", countryEs: "Kirguistán", countryEn: "Kyrgyzstan", flag: "🇰🇬", recommended: false, aliases: ["Кыргызча","Kirguís","Kyrgyz","Кыргызстан","Kirguistán","Kyrgyzstan","KG","ky","ky-KG","🇰🇬","kirguis","kyrgyz","kirguistan","kyrgyzstan"] },
  { code: "lo-LA", label: "ລາວ", country: "ລາວ", countryEs: "Laos", countryEn: "Laos", flag: "🇱🇦", recommended: false, aliases: ["ລາວ","Lao","Laos","LA","lo","lo-LA","🇱🇦","lao","laos"] },
  { code: "lv-LV", label: "Latviešu", country: "Latvija", countryEs: "Letonia", countryEn: "Latvia", flag: "🇱🇻", recommended: false, aliases: ["Latviešu","Letón","Latvian","Latvija","Letonia","Latvia","LV","lv","lv-LV","🇱🇻","leton","latvian","letonia","latvia"] },
  { code: "lt-LT", label: "Lietuvių", country: "Lietuva", countryEs: "Lituania", countryEn: "Lithuania", flag: "🇱🇹", recommended: false, aliases: ["Lietuvių","Lituano","Lithuanian","Lietuva","Lituania","Lithuania","LT","lt","lt-LT","🇱🇹","lituano","lithuanian","lituania","lithuania"] },
  { code: "lb-LU", label: "Lëtzebuergesch", country: "Lëtzebuerg", countryEs: "Luxemburgo", countryEn: "Luxembourg", flag: "🇱🇺", recommended: false, aliases: ["Lëtzebuergesch","Luxemburgués","Luxembourgish","Lëtzebuerg","Luxemburgo","Luxembourg","LU","lb","lb-LU","🇱🇺","luxemburgo","luxembourg"] },
  { code: "mk-MK", label: "Македонски", country: "Македонија", countryEs: "Macedonia del Norte", countryEn: "North Macedonia", flag: "🇲🇰", recommended: false, aliases: ["Македонски","Macedonio","Macedonian","Македонија","Macedonia del Norte","North Macedonia","MK","mk","mk-MK","🇲🇰","macedonio","macedonian","macedonia"] },
  { code: "ms-MY", label: "Bahasa Melayu", country: "Malaysia", countryEs: "Malasia", countryEn: "Malaysia", flag: "🇲🇾", recommended: false, aliases: ["Bahasa Melayu","Malayo","Malay","Malaysia","Malasia","MY","ms","ms-MY","🇲🇾","malayo","malay","malasia","malaysia"] },
  { code: "ml-IN", label: "മലയാളം", country: "India", countryEs: "India (malabar)", countryEn: "India (Malayalam)", flag: "🇮🇳", recommended: false, aliases: ["മലയാളം","Malayalam","India","ml","ml-IN","🇮🇳","malayalam","india"] },
  { code: "mt-MT", label: "Malti", country: "Malta", countryEs: "Malta", countryEn: "Malta", flag: "🇲🇹", recommended: false, aliases: ["Malti","Maltés","Maltese","Malta","MT","mt","mt-MT","🇲🇹","maltes","maltese","malta"] },
  { code: "mr-IN", label: "मराठी", country: "भारत", countryEs: "India (marathi)", countryEn: "India (Marathi)", flag: "🇮🇳", recommended: false, aliases: ["मराठी","Maratí","Marathi","भारत","India","mr","mr-IN","🇮🇳","marati","marathi","india"] },
  { code: "mn-MN", label: "Монгол", country: "Монгол", countryEs: "Mongolia", countryEn: "Mongolia", flag: "🇲🇳", recommended: false, aliases: ["Монгол","Mongol","Mongolian","Mongolia","MN","mn","mn-MN","🇲🇳","mongol","mongolian","mongolia"] },
  { code: "ne-NP", label: "नेपाली", country: "नेपाल", countryEs: "Nepal", countryEn: "Nepal", flag: "🇳🇵", recommended: false, aliases: ["नेपाली","Nepalés","Nepali","नेपाल","Nepal","NP","ne","ne-NP","🇳🇵","nepales","nepali","nepal"] },
  { code: "nb-NO", label: "Norsk", country: "Norge", countryEs: "Noruega", countryEn: "Norway", flag: "🇳🇴", recommended: false, aliases: ["Norsk","Noruego","Norwegian","Norge","Noruega","Norway","NO","nb","nb-NO","🇳🇴","noruego","norwegian","noruega","norway"] },
  { code: "nn-NO", label: "Nynorsk", country: "Norge", countryEs: "Noruega (nynorsk)", countryEn: "Norway (Nynorsk)", flag: "🇳🇴", recommended: false, aliases: ["Nynorsk","Noruego","Norwegian","Norge","Noruega","Norway","nn","nn-NO","🇳🇴","noruego","norwegian","noruega"] },
  { code: "or-IN", label: "ଓଡ଼ିଆ", country: "India", countryEs: "India (odia)", countryEn: "India (Odia)", flag: "🇮🇳", recommended: false, aliases: ["ଓଡ଼ିଆ","Odia","Oriya","India","or","or-IN","🇮🇳","odia","oriya","india"] },
  { code: "ps-AF", label: "پښتو", country: "افغانستان", countryEs: "Afganistán", countryEn: "Afghanistan", flag: "🇦🇫", recommended: false, aliases: ["پښتو","Pastún","Pashto","افغانستان","Afganistán","Afghanistan","AF","ps","ps-AF","🇦🇫","pastun","pashto","afganistan","afghanistan"] },
  { code: "fa-IR", label: "فارسی", country: "ایران", countryEs: "Irán", countryEn: "Iran", flag: "🇮🇷", recommended: false, aliases: ["فارسی","Persa","Persian","Farsi","ایران","Irán","Iran","IR","fa","fa-IR","🇮🇷","persa","persian","farsi","iran"] },
  { code: "pl-PL", label: "Polski", country: "Polska", countryEs: "Polonia", countryEn: "Poland", flag: "🇵🇱", recommended: false, aliases: ["Polski","Polaco","Polish","Polska","Polonia","Poland","PL","pl","pl-PL","🇵🇱","polaco","polish","polonia","poland"] },
  { code: "pa-IN", label: "ਪੰਜਾਬੀ", country: "India", countryEs: "India (punjabi)", countryEn: "India (Punjabi)", flag: "🇮🇳", recommended: false, aliases: ["ਪੰਜਾਬੀ","Punjabí","Punjabi","India","pa","pa-IN","🇮🇳","punjabi","india"] },
  { code: "ro-RO", label: "Română", country: "România", countryEs: "Rumanía", countryEn: "Romania", flag: "🇷🇴", recommended: false, aliases: ["Română","Rumano","Romanian","România","Rumanía","Romania","RO","ro","ro-RO","🇷🇴","rumano","romanian","rumania","romania"] },
  { code: "sr-RS", label: "Српски", country: "Србија", countryEs: "Serbia", countryEn: "Serbia", flag: "🇷🇸", recommended: false, aliases: ["Српски","Serbio","Serbian","Србија","Serbia","RS","sr","sr-RS","🇷🇸","serbio","serbian","serbia"] },
  { code: "si-LK", label: "සිංහල", country: "ශ්‍රී ලංකා", countryEs: "Sri Lanka", countryEn: "Sri Lanka", flag: "🇱🇰", recommended: false, aliases: ["සිංහල","Cingalés","Sinhala","ශ්‍රී ලංකා","Sri Lanka","LK","si","si-LK","🇱🇰","cingales","sinhala","sri lanka"] },
  { code: "sk-SK", label: "Slovenčina", country: "Slovensko", countryEs: "Eslovaquia", countryEn: "Slovakia", flag: "🇸🇰", recommended: false, aliases: ["Slovenčina","Eslovaco","Slovak","Slovensko","Eslovaquia","Slovakia","SK","sk","sk-SK","🇸🇰","eslovaco","slovak","eslovaquia","slovakia"] },
  { code: "sl-SI", label: "Slovenščina", country: "Slovenija", countryEs: "Eslovenia", countryEn: "Slovenia", flag: "🇸🇮", recommended: false, aliases: ["Slovenščina","Esloveno","Slovenian","Slovenija","Eslovenia","Slovenia","SI","sl","sl-SI","🇸🇮","esloveno","slovenian","eslovenia","slovenia"] },
  { code: "so-SO", label: "Soomaali", country: "Soomaaliya", countryEs: "Somalia", countryEn: "Somalia", flag: "🇸🇴", recommended: false, aliases: ["Soomaali","Somalí","Somali","Soomaaliya","Somalia","SO","so","so-SO","🇸🇴","somali","somalia"] },
  { code: "es-AR", label: "Español", country: "Argentina", countryEs: "Argentina", countryEn: "Argentina", flag: "🇦🇷", recommended: false, aliases: ["Español","Spanish","Argentina","AR","es-AR","🇦🇷","espanol","spanish","argentina"] },
  { code: "es-CL", label: "Español", country: "Chile", countryEs: "Chile", countryEn: "Chile", flag: "🇨🇱", recommended: false, aliases: ["Español","Spanish","Chile","CL","es-CL","🇨🇱","espanol","spanish","chile"] },
  { code: "es-CO", label: "Español", country: "Colombia", countryEs: "Colombia", countryEn: "Colombia", flag: "🇨🇴", recommended: false, aliases: ["Español","Spanish","Colombia","CO","es-CO","🇨🇴","espanol","spanish","colombia"] },
  { code: "es-MX", label: "Español", country: "México", countryEs: "México", countryEn: "Mexico", flag: "🇲🇽", recommended: false, aliases: ["Español","Spanish","México","Mexico","MX","es-MX","🇲🇽","espanol","spanish","mexico","méxico"] },
  { code: "es-US", label: "Español", country: "Estados Unidos", countryEs: "Estados Unidos", countryEn: "United States (Spanish)", flag: "🇺🇸", recommended: false, aliases: ["Español","Spanish","Estados Unidos","United States","US","es-US","🇺🇸","espanol","spanish","estados unidos"] },
  { code: "sw-KE", label: "Kiswahili", country: "Kenya", countryEs: "Kenia", countryEn: "Kenya", flag: "🇰🇪", recommended: false, aliases: ["Kiswahili","Suajili","Swahili","Kenya","Kenia","KE","sw","sw-KE","🇰🇪","suajili","swahili","kenia","kenya"] },
  { code: "sv-SE", label: "Svenska", country: "Sverige", countryEs: "Suecia", countryEn: "Sweden", flag: "🇸🇪", recommended: false, aliases: ["Svenska","Sueco","Swedish","Sverige","Suecia","Sweden","SE","sv","sv-SE","🇸🇪","sueco","swedish","suecia","sweden"] },
  { code: "tl-PH", label: "Filipino", country: "Pilipinas", countryEs: "Filipinas", countryEn: "Philippines", flag: "🇵🇭", recommended: false, aliases: ["Filipino","Tagalog","Pilipinas","Filipinas","Philippines","PH","tl","tl-PH","🇵🇭","tagalog","filipino","filipinas","philippines"] },
  { code: "tg-TJ", label: "Тоҷикӣ", country: "Тоҷикистон", countryEs: "Tayikistán", countryEn: "Tajikistan", flag: "🇹🇯", recommended: false, aliases: ["Тоҷикӣ","Tayiko","Tajik","Тоҷикистон","Tayikistán","Tajikistan","TJ","tg","tg-TJ","🇹🇯","tayiko","tajik","tayikistan","tajikistan"] },
  { code: "ta-IN", label: "தமிழ்", country: "India", countryEs: "India (tamil)", countryEn: "India (Tamil)", flag: "🇮🇳", recommended: false, aliases: ["தமிழ்","Tamil","India","ta","ta-IN","🇮🇳","tamil","india"] },
  { code: "te-IN", label: "తెలుగు", country: "India", countryEs: "India (telugu)", countryEn: "India (Telugu)", flag: "🇮🇳", recommended: false, aliases: ["తెలుగు","Telugu","India","te","te-IN","🇮🇳","telugu","india"] },
  { code: "th-TH", label: "ภาษาไทย", country: "ประเทศไทย", countryEs: "Tailandia", countryEn: "Thailand", flag: "🇹🇭", recommended: false, aliases: ["ภาษาไทย","Tailandés","Thai","ประเทศไทย","Tailandia","Thailand","TH","th","th-TH","🇹🇭","tailandes","thai","tailandia","thailand"] },
  { code: "ti-ER", label: "ትግርኛ", country: "ኤርትራ", countryEs: "Eritrea", countryEn: "Eritrea", flag: "🇪🇷", recommended: false, aliases: ["ትግርኛ","Tigrinya","ኤርትራ","Eritrea","ER","ti","ti-ER","🇪🇷","tigrinya","eritrea"] },
  { code: "tr-TR", label: "Türkçe", country: "Türkiye", countryEs: "Turquía", countryEn: "Turkey", flag: "🇹🇷", recommended: false, aliases: ["Türkçe","Turco","Turkish","Türkiye","Turquía","Turkey","TR","tr","tr-TR","🇹🇷","turco","turkish","turquia","turkey"] },
  { code: "tk-TM", label: "Türkmen", country: "Türkmenistan", countryEs: "Turkmenistán", countryEn: "Turkmenistan", flag: "🇹🇲", recommended: false, aliases: ["Türkmen","Turcomano","Turkmen","Türkmenistan","Turkmenistán","Turkmenistan","TM","tk","tk-TM","🇹🇲","turcomano","turkmen","turkmenistan"] },
  { code: "uk-UA", label: "Українська", country: "Україна", countryEs: "Ucrania", countryEn: "Ukraine", flag: "🇺🇦", recommended: false, aliases: ["Українська","Ucraniano","Ukrainian","Україна","Ucrania","Ukraine","UA","uk","uk-UA","🇺🇦","ucraniano","ukrainian","ucrania","ukraine"] },
  { code: "ur-PK", label: "اردو", country: "پاکستان", countryEs: "Pakistán", countryEn: "Pakistan", flag: "🇵🇰", recommended: false, aliases: ["اردو","Urdu","پاکستان","Pakistán","Pakistan","PK","ur","ur-PK","🇵🇰","urdu","pakistan","pakistán"] },
  { code: "uz-UZ", label: "Oʻzbekcha", country: "Oʻzbekiston", countryEs: "Uzbekistán", countryEn: "Uzbekistan", flag: "🇺🇿", recommended: false, aliases: ["Oʻzbekcha","Uzbeko","Uzbek","Oʻzbekiston","Uzbekistán","Uzbekistan","UZ","uz","uz-UZ","🇺🇿","uzbeko","uzbek","uzbekistan"] },
  { code: "vi-VN", label: "Tiếng Việt", country: "Việt Nam", countryEs: "Vietnam", countryEn: "Vietnam", flag: "🇻🇳", recommended: false, aliases: ["Tiếng Việt","Vietnamita","Vietnamese","Việt Nam","Vietnam","VN","vi","vi-VN","🇻🇳","vietnamita","vietnamese","vietnam"] },
  { code: "cy-GB", label: "Cymraeg", country: "Cymru", countryEs: "Gales", countryEn: "Wales", flag: "🏴󠁧󠁢󠁷󠁬󠁳󠁿", recommended: false, aliases: ["Cymraeg","Galés","Welsh","Cymru","Gales","Wales","cy","cy-GB","🏴󠁧󠁢󠁷󠁬󠁳󠁿","gales","welsh","wales"] },
  { code: "yi-001", label: "ייִדיש", country: "World", countryEs: "Internacional", countryEn: "International", flag: "🌍", recommended: false, aliases: ["ייִדיש","Yídish","Yiddish","International","Internacional","yi","yi-001","🌍","yidish","yiddish"] },
  { code: "yo-NG", label: "Yorùbá", country: "Nigeria", countryEs: "Nigeria", countryEn: "Nigeria", flag: "🇳🇬", recommended: false, aliases: ["Yorùbá","Yoruba","Nigeria","NG","yo","yo-NG","🇳🇬","yoruba","nigeria"] },
];

function sortLanguages(list) {
  return [...list].sort((a, b) => {
    const la = normalizeSearchText(a.label);
    const lb = normalizeSearchText(b.label);
    if (la !== lb) return la.localeCompare(lb, "es", { sensitivity: "base" });
    return normalizeSearchText(a.country).localeCompare(normalizeSearchText(b.country), "es", { sensitivity: "base" });
  });
}

export const LANGUAGES_ALL = sortLanguages(LANGUAGES_RAW);
export const LANGUAGES_RECOMMENDED = sortLanguages(LANGUAGES_RAW.filter(l => l.recommended));

export function loadSavedLanguage() {
  try {
    const raw = localStorage.getItem("cp04_language");
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (parsed && parsed.code && LANGUAGES_RAW.find(l => l.code === parsed.code)) return parsed;
    return null;
  } catch {
    return null;
  }
}

// ============================================================
// i18n — Sistema de traducciones global
// ============================================================

const LANG_CHANGE_EVENT = "cp04:lang-change";

const _defaultLang = LANGUAGES_RAW.find(l => l.code === "es-ES");

let _globalLang = (() => {
  try {
    const raw = localStorage.getItem("cp04_language");
    if (!raw) return _defaultLang;
    const parsed = JSON.parse(raw);
    if (parsed?.code && LANGUAGES_RAW.find(l => l.code === parsed.code)) return parsed;
  } catch {
    // localStorage puede lanzar en modo privado/Safari; usar el idioma por defecto.
  }
  return _defaultLang;
})();

export function setGlobalLang(lang) {
  _globalLang = lang || _defaultLang;
  try {
    localStorage.setItem("cp04_language", JSON.stringify(_globalLang));
  } catch {
    // localStorage puede lanzar en modo privado/Safari; el idioma sigue en memoria.
  }
  window.dispatchEvent(new CustomEvent(LANG_CHANGE_EVENT, { detail: { lang: _globalLang } }));
}

export function useLang() {
  const [lang, setLang] = useState(() => _globalLang);
  useEffect(() => {
    function handler(e) { setLang(e.detail?.lang || _defaultLang); }
    window.addEventListener(LANG_CHANGE_EVENT, handler);
    return () => window.removeEventListener(LANG_CHANGE_EVENT, handler);
  }, []);
  return lang;
}


