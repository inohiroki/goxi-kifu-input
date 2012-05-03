// ==UserScript==
// @name           goxi-kifu-input
// @namespace      http://ino.xrea.jp/
// @description    goxiへ棋譜入力機能を追加する
// @include        http://goxi.jp/diary/*
// @require        http://ajax.googleapis.com/ajax/libs/jquery/1.7.2/jquery.min.js
// ==/UserScript==

/*
 * 碁盤ボタンの追加
 */
var data = 'data:image/gif;base64,'+
'R0lGODlhFAAUAFA8ACH5BAEAADwALAAAAAAUABQAh76+vv////7+/r6bEPv7+/r6+vj4+Pz8/P39'+
'/fX19f/0pu/v7/n5+fHx8e7u7ppvABWr4jS25fPz89nZ2c+2UzS25v/3v/ngNtnHgM20UdS2JySw'+
'5OnNLOvRPuzhrv/979Xt7tW9VvrzyebZqfbdP/3nUdO0IuHUpOTYp+zcjNW9XuTYqP/72b7m9L7m'+
'9dC3VHLM7c/t+M3r9sDo93HL7L/n9sHGkOz2+d/z+kS86EO759vKg////wAAAAAAAAAAAAAAAAAA'+
'AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA'+
'AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA'+
'AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA'+
'AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA'+
'AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA'+
'AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA'+
'AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA'+
'AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA'+
'AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA'+
'AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA'+
'AAhzAAMAGEiwoEGCAicEWNijYcOFECFOGAjRocWIESkGsMgR40KKHEN6BBnyIsaBJUtmBJCyYw+I'+
'KFs6ZPgRwEaZEV+SbJlToM2bKjH20AjUpFCiRV963IiU5tKNPj0qXarzp1CqNZ9OdepTIVWjE30e'+
'HIswIAA7';
var $gobanimage = $("<img/>").attr(	"src", data);
var $gobanbutton = $("<a/>").attr("href", "#").append($gobanimage);
$("#diary_body_button_op_emoji_docomo").after($gobanbutton);
$gobanbutton.click(function() {
	$("#kifuinput").toggle();
	return false;
});

/*
 * 石葉
 */
var $goban = $("<APPLET/>").attr({
	code: "KifuShow.LeafShow.class",
	codebase: "/MyLeaf",
	height: "580",
	width: 410,
	archive:"LeafShow2.jar",
	name:"LeafShow",
	id: "KifuInputLeafShow" // 一意になりそうなIDを適当に付ける
});
$goban.append("<param name='advancemoves' value='true'>" +
		"<param name='layout' value='./Kanki/goxi.xml'>" +
		"<param name='leafhint' VALUE='true'>" +
		"<PARAM NAME='startmese' VALUE='goxi!'>" +
		"<param name='moves' value=''>"
);

/*
 * 棋譜ファイル読み込み
 */
var $kifureadfile = $("<input/>").attr({
	type: "file",
	id: "file"
}).before("<label/>").attr("for", "file").text("＜棋譜ファイルを選択＞");
$kifureadfile.change(function() {
	var file = document.getElementById("file").files.item(0);
	var reader = new FileReader();
	reader.readAsText(file);
	reader.onload = function(evt){
		var str = evt.target.result;
		var ishiba = unsafeWindow.document.getElementById("KifuInputLeafShow").wrappedJSObject;
		ishiba.ta1.setText(SGF2isiba(FF4conv(str)));
		ishiba.ExeCmd("LEAF_READ");
		ishiba.ExeCmd("LEAF_GO_LAST");
	};
});

/*
 * 棋譜読み込みキストボックス
 */
var $kifureadtext = $("<textarea/>").attr({
	rows: "3",
	id: "kifutext",
	value: "ここに棋譜を貼りつけて下さい"
}).css({
	width: "50%",
	verticalAlign: "middle"
}).before("<label/>").attr("for", "kifutext").text("＜棋譜データを入力＞");

$kifureadtext.bind("input", function(){
	var str = document.getElementById("kifutext").value;
	var ishiba = unsafeWindow.document.getElementById("KifuInputLeafShow").wrappedJSObject;
	ishiba.ta1.setText(SGF2isiba(FF4conv(str)));
	ishiba.ExeCmd("LEAF_READ");
	ishiba.ExeCmd("LEAF_GO_LAST");
});
$kifureadtext.bind("click", function(){
	document.getElementById("kifutext").value = "";
});

/*
 * 棋譜コピーボタンの追加
 */
var $kifucopy = $("<button/>").attr({
	type: "button"
}).text("棋譜コピー");
$kifucopy.bind("click", function(){
	var str = unsafeWindow.document.getElementById("KifuInputLeafShow").wrappedJSObject.GetSendKifuStr();
	str = "\n_KIFU_START_\n" + str + "\n_KIFU_END_\n";
	$("#diary_body").insertAtCaret(str);

});

/*
 * 棋譜コピーボタン変化図つきの追加
 */
var $branch = $("<button/>").attr("type", "button").text("棋譜コピー(変化図付き)");
$branch.bind("click", function(){
	unsafeWindow.document.getElementById("KifuInputLeafShow").wrappedJSObject.ExeCmd("SGF_ALLDATA");
	var str = unsafeWindow.document.getElementById("KifuInputLeafShow").wrappedJSObject.ta1.getText();
	str = str.replace(/ID\[[0-9]*\]/g,'');
	str = str.replace(/\r/g,'');
	str = str.replace(/\n/g,'');
	str = str.replace(/\s/g,'');
	str = "\n_KIFU_START_\n" + str + "\n_KIFU_END_\n";
	$("#diary_body").insertAtCaret(str);
});

/*
 * 全体の追加
 */
var $kifuinput = $("<div/>").attr("id", "kifuinput").css("border", "3px solid #00ff00");
$kifuinput
.append($kifureadfile)
.append($("<br/>"))
.append($kifureadtext)
.append($goban)
.append($kifucopy)
.append($branch);

$kifuinput.hide(); // 最初は非表示
$("#diary_body").before($kifuinput);

/*
 * カーソル位置にテキスト挿入
 */
$.fn.extend({
	insertAtCaret: function(v) {
	var o = this.get(0);
	o.focus();
	if (jQuery.browser.msie) {
		var r = document.selection.createRange();
		r.text = v;
		r.select();
	} else {
		var s = o.value;
		var p = o.selectionStart;
		var np = p + v.length;
		o.value = s.substr(0, p) + v + s.substr(p);
		o.setSelectionRange(np, np);
	}
}
});

/*
 * 以下、棋譜補正ツールのページから http://qin.up.seesaa.net/kifu/kifuconv.html
 */
function yahoo2Sgf(ya)
{
	if(ya.match(/SGF形式の棋譜も/)) ya = ya.before("SGF形式の棋譜も");
	ya = ya.replace(/\s+$/g, "");
	for(var g = 2; g > 0; g--)
	{
		var a1 = ya.lastIndexOf(".");
		var a2 = ya.lastIndexOf("パス");

		if(a2 > a1)
		{
			var a3 = ya.lastIndexOf("-");
			if(a1 > a3) ya = ya.substr(0, ya.lastIndexOf("\n"));
			else ya = ya.substr(0, a2);
		}
	}
	ya += "\n";
	var str = "(;GM[1]FF[1]GN[Yahoo! Go]SZ[19]KM[7.5]";
	str += "PB[" + ya.dat("黒番: ", "\n") + "]";
	str += "PW[" + ya.dat("白番: ", "\n") + "]";
	str += "DT[" + ya.dat("送信時刻: ", " ") + "]";
	str += "CP[" + ya.dat("送信者: ", "\n") + "]";

	var arr = ya.split("パス");
	if(arr.length > 1) // 置き碁
	{
		str += "HA[" + arr.length + "]\nAB";
		for(var g in arr) { str += "[" + yahooPos(arr[g].dat(". " , " ")) + "]"; }
		var fir =  arr[arr.length - 1].after("\n");
		ya = fir.after("\n");
		fir = fir.before("\n");
		var tt = fir.split(" ");
		str += "\n;W[" + yahooPos(tt[tt.length - 1]) + "]";
	}

	arr = ya.dats(". ", "\n");
	for(var g in arr) // 着手
	{
		var kuro = arr[g].before(" ");
		if(kuro.indexOf("(") > -1) { kuro = kuro.before("("); }
		var siro = arr[g].after(" ");
		if(siro.indexOf("(") > -1) { siro = siro.before("("); }

		if(kuro != "") str += "\n;B[" + yahooPos(kuro) + "]";
		if(siro != "") str += "\n;W[" + yahooPos(siro) + "]";
	}
	str += ")";

	return str;
}

function yahooPos(str)  // Yahoo座標をSGFに変換
{
	var yoko = str.substr(0,1).charCodeAt(0);
	if(yoko > 105) yoko--;
	var tate = 20 - str.after("-") + 96 ;
	return String.fromCharCode(yoko) + String.fromCharCode(tate);
}

//[Stringオブジェクトに付加]
String.prototype.before = function(str) // 指定文字列より前の部分を返す
{
	var tmp = this.indexOf(str);
	return (tmp > -1 ? this.substring(0,tmp) : "");
};

String.prototype.after = function(str) // 指定文字列より後の部分を返す
{
	var tmp = this.indexOf(str);
	return (tmp > -1 ? this.substring(tmp + str.length) : "");
};

String.prototype.dat = function(head, tail) // タグ中のデータを返す
{
	return this.after(head).before(tail);
};

String.prototype.dats = function(head, tail) // タグ中のデータ(複数)を返す
{
	var tmp = this.split(head);
	var arr = new Array();
	for(var g in tmp) { if(g > 0) arr.push(tmp[g].before(tail)); }
	return arr;
};
//---------------------------------------------------

function SGFsplit(SGF){
	var index=0;
	var i=0;
	var j=0;
	Element = new Array;

	prop= SGF.match(/[A-Z]+(\s*\[([^\]]*\\\])*[^\]]*\])+|\(|\)|\;/);
	// property or '(' or ')' or ';'
	while(prop!=null){
		PROP=prop[0];
		i=SGF.indexOf(PROP);
		if(i>0){
			Element[index] = SGF.substr(0,i);
			index++;
			SGF=SGF.substr(i);
		}else if(i==0){
			Element[index] = PROP;
			index++;
			SGF=SGF.substr(i+PROP.length);
		}
		prop= SGF.match(/[A-Z]+(\s*\[([^\]]*\\\])*[^\]]*\])+|\(|\)|\;/);
	}
	if(SGF!=''){
		Element[index]=SGF;
	}
	return(Element);
}
// ---------------------------------------------------------

function gib2sgf(str)  // GIB -> SGF 変換
{
	if(!str.match(/\\HS\s/)) { return str; }

	var arr = str.split("\nSTO ");
	str = arr[0];
	var oki = str.split("\nINI ")[1].split(" ")[2] * 1;
	str = str.split("\\GS")[0];

	str = str.replace(/\\(HS|HE|GS|GE|\[TYPE=\d\\\]|\[SZAUDIO=\d\\\]|\[GAMETOTALNUM=.*?\\\]|\[GAMETAG=.*?\\\])\s+/g, "");
	str = str.replace(/\\\[GAMENAME=(.*?)\\\]/, "GN[$1]");
	str = str.replace(/\\\[GAMEDATE=(.*?)\\\]/, "DT[$1]");
	str = str.replace(/\\\[GAMEPLACE=(.*?)\\\]/, "PC[$1]");
	str = str.replace(/\\\[GAMECONDITION=(.*?)\\\]/, "AN[$1]");
	str = str.replace(/\\\[GAMETIME=(.*?)\s+(.*?)\\\]/, "TM[$1$2]");
	str = str.replace(/\\\[GAMEWHITENAME=(.*?)\\\]/, "PW[$1]");
	str = str.replace(/\\\[GAMEBLACKNAME=(.*?)\\\]/, "PB[$1]");
	str = str.replace(/\\\[GAMERESULT=(.*?)\\\]/, "RE[$1]");
	str = str.replace(/\\\[GAMECOMMENT=(.*?)\\\]/, "GC[$1]");
	if(oki > 0) { str += "HA[" + oki + "]\n"; }

	var kuroSaki = oki < 2, mov = "", okiStr = "";
	if(oki > 1 && oki < 10) // 置石
	{
		var table = new Array ("[dp]", "[pd]", "[dd]","[pp]", "[jj]", "[dj]", "[pj]", "[jd]", "[jp]");
		okiStr = "AB" + table[0] + table[1];   // 左下隅星 + 右上隅星
		if(oki > 2) { okiStr += table[2]; }
		if(oki > 3) { okiStr += table[3]; }
		if(oki > 4) // ５子以上の置石
		{
			if(oki % 2) { okiStr += table[4]; } // 天元
			if(oki > 5) { okiStr += table[5] + table[6]; }
			if(oki > 7) { okiStr += table[7] + table[8]; }
		}
		okiStr += "\n";
	}

	for(var g = 1; g < arr.length; g++) // 手順
	{
		var iro = (kuroSaki == g%2 ? ";B[" : ";W[");
		var tmp = arr[g].split(" ");
		mov += iro  + String.fromCharCode(97 + tmp[3] * 1) + String.fromCharCode(97 + tmp[4] * 1) + "]\n";
	}

	str = "(;GM[1]FF[1]\n" + str + okiStr + mov + ")";

	return str;
}

// ---------------------------------------------------------
function contractMK(inputSGF){
	var i=0;
	var n=0;
	var MK='';
	var outputSGF='';

	SGFelement=SGFsplit(inputSGF);
	n=SGFelement.length;
	for (i=0; i<n; i++){
		if(SGFelement[i].search(/\(|\)|\;/)==0){
			// Node end
			if(MK!=''){
				outputSGF += MK+']';
			}
			MK='';
			outputSGF += SGFelement[i];
		}else if(SGFelement[i].search( /MK\s*\[.*\]$/ )==0){
			if(MK==''){
				MK=SGFelement[i].replace(/\]$/,'');
			}else{
				MK+=','+SGFelement[i].replace(/\]$/,'').replace( /MK\s*\[/,'');
			}
		}else{
			outputSGF += SGFelement[i];
		}
	}
	return(outputSGF);
}
// ---------------------------------------------------------
// ---------------------------------------------------------
function MarkupProp2MK(PROP){
	var i=0;
	var xy='';
	returnTXT=PROP;

	if(PROP.search( /LB\s*\[[a-z]{2}\:[^\]]*\]/ )==0){
		returnTXT='MK[';
		value = PROP.match( /\[[a-z]{2}\:[^\]]*\]/);
		while(value!=null){
			VALUE=value[0];
			i=PROP.indexOf(VALUE);
			xy=VALUE.substr(1,2);
			mark=VALUE.match( /\:[^\]]*\]/)[0];
			mark=mark.substr(1,1);
			if(returnTXT!='MK['){
				returnTXT+= ',';
			}
			returnTXT += mark+xy;
			PROP=PROP.substr(i+VALUE.length);
			value = PROP.match( /\[[a-z]{2}\:[^\]]*\]/);
		}
		returnTXT += ']';
	}if(PROP.search( /(CR|MA|SL|SQ|TR)\s*\[[a-z]{2}\]/ )==0){
		switch (PROP.substr(0,2)) {
		case "CR":
			returnTXT="MK[○";
			break;
		case "MA":
			returnTXT="MK[×";
			break;
		case "SL":
			returnTXT="MK[■";
			break;
		case "SQ":
			returnTXT="MK[□";
			break;
		case "TR":
			returnTXT="MK[△";
			break;
		}
		value = PROP.match( /\[[a-z]{2}\]/);
		while(value!=null){
			VALUE=value[0];
			i=PROP.indexOf(VALUE);
			xy=VALUE.substr(1,2);
			returnTXT += xy;
			PROP=PROP.substr(i+VALUE.length);
			value = PROP.match( /\[[a-z]{2}\]/);
		}
		returnTXT+="]";
	}
	return(returnTXT);
}
// ---------------------------------------------------------
function Markup2MK(inputSGF) {
	var i=0;
	var n=0;

	outputSGF="";
	SGFelement=SGFsplit(inputSGF);
	n=SGFelement.length;
	for (i=0; i<n; i++){
		if(SGFelement[i].search(/[A-Z]+(\s*\[([^\]]*\\\])*[^\]]*\])+/) >= 0){
			outputSGF+=MarkupProp2MK(SGFelement[i]);
		}else{
			outputSGF+=SGFelement[i];
		}
	}
	return(outputSGF);
}
// ---------------------------------------------------------
function changeOrder(inputSGF) {
	var i=0;
	var n=0;
	var mvProp='';

	SGFelement=SGFsplit(inputSGF);
	n=SGFelement.length;
	for (i=n-1; i>=0; i--){
		if (SGFelement[i]==';'){
			mvProp='';
		}else if(SGFelement[i].search(/(B|W)\s*\[.*\]$/)==0){
			mvProp=SGFelement[i];
		}else{
			if(mvProp != ''){
				SGFelement[i+1]=SGFelement[i];
				SGFelement[i]  =mvProp;
			}
		}
	}
	outputSGF='';
	for (i=0; i<n; i++){
		outputSGF+=SGFelement[i];
	}
	return(outputSGF);
}
//---------------------------------------------------------
function fixKGS(str)
{
	if((ind = str.indexOf(";W[")) > -1 &&
			(arr = (s2 = str.substr(0, ind)).match(/;B\[..\]/g)) && arr.length > 1)
	{
		s2 = s2.replace(/;B\[..\]/g, "") + "AB";
		for(var g = 0; g < arr.length; g++) { s2 += arr[g].substr(2); }
		str = s2 + "\n" + str.substr(ind);
	}
	str = str.replace(/CR\[.*?\]/g, "");
	str = str.replace(/[BW]L\[.*?\]/g, "");
	return str;
}

//-----------------------------------------------------
function ig12sgf(str)  // IG1 -> SGF 変換
{
	while(str.match(/ [\w|\W]+\s+INT/))
	{
		str = str.replace(/ ([\w|\W]+\s+INT)/g, "ss5ss$1");
	}

	var ano = !str.match(/\n黒番　/);  // 棋譜情報解析不能形式
	if(ano)
	{
		str = str.replace(/#COMMENT([\w|\W]+)(INT\s+\d+)/, "GC[$1]\n$2");
		str = str.replace(/#comment([\w|\W]+)(INT\s+\d+)/, "GC[$1]\n$2");
	}

	str = str.replace(/\r\n\r\n|\n\n/g, "\n");
	str = str.replace(/(INT\s+\d+)\s[^\d]/, "$1 0\n");
	str = str.replace(/#COMMENT\s+(.+)\s+/, "DT[$1]\n");
	str = str.replace(/(白番.+\s+)(.+)\s+/, "$1RE[$2]\n");
	str = str.replace(/(ユーザー名.+\s+)(.+)\s+/, "$1RU[$2]\n");
	str = str.replace(/黒番　(.+)/, "PB[$1]");
	str = str.replace(/白番　(.+)/, "PW[$1]");
	str = str.replace(/黒番ランク　(.+)/, "BR[$1]");
	str = str.replace(/白番ランク　(.+)/, "WR[$1]");
	str = str.replace(/対局場所　(.+)/, "PC[$1]");
	str = str.replace(/対局名　(.+)/, "GN[$1]");
	str = str.replace(/大会名　(.+)/, "EV[$1]");
	str = str.replace(/ラウンド　(.+)/, "RO[$1]");
	str = str.replace(/コミ　(.+)/, "KM[$1]");
	str = str.replace(/ゲームコメント　(.+)/, "GC[$1]");
	str = str.replace(/出典　(.+)/, "CP[$1]");
	str = str.replace(/ユーザー名　(.+)/, "US[$1]");
	str = str.replace(/持時間　(.+)/, "TM[$1]");
	str = str.replace(/INT (\d+) (\d+)/, "SZ[$1]\nHA[$2]");
	str = str.replace(/[\r|\n]\]/g, "]");

	var oki = str.charAt(str.indexOf("HA[") + 3) * 1;
	var kuroSaki = oki < 2; // (str.charAt(str.indexOf("HA[") + 3) == '0');
	var arr = str.split(" ");
	var mov = "";
	var limit = arr.length - 1;

	for(var g = 1; g < limit; g++)
	{
		var iro = (kuroSaki == g%2 ? ";B[" : ";W[");
		var suu = arr[g].charCodeAt(0);
		if(suu > 73) { suu --; }
		var pos = String.fromCharCode(suu + 32) +
		String.fromCharCode(1 * arr[g].substring(1) + 96);
		mov += "\n" + iro + pos + "]";
	}

	str = str.replace(/\s+MOV[\w|\W]+/, "");
	str = str.replace(/ss5ss/g, " ");
	str = str.replace(/\[\s+/g, "[");
	str = str.replace(/\s+\]/g, "]");

	if(ano) { str = str.replace(/HA\[\d+\]\s*/, ""); }

	var okiStr = "";
	if(oki > 1 && oki < 10) // 置石文字列
	{
		var table = new Array ("[dp]", "[pd]", "[pp]","[dd]", "[jj]", "[dj]", "[pj]", "[jd]", "[jp]");
		okiStr = "AB" + table[0] + table[1];   // 左下隅星 + 右上隅星
		if(oki > 2) { okiStr += table[2]; }
		if(oki > 3) { okiStr += table[3]; }
		if(oki > 4) // ５子以上の置石
		{
			if(oki % 2) { okiStr += table[4]; } // 天元
			if(oki > 5) { okiStr += table[5] + table[6]; }
			if(oki > 7) { okiStr += table[7] + table[8]; }
		}
	}

	str = "(;GM[1]FF[1]\n" + str + okiStr + mov + "\n)";

	return str;
}

//---------------------------------------------------------
function SGF2isiba(SGF) {
	if(SGF.match(/1\. /)) { return yahoo2Sgf(SGF); }
	if(SGF.match(/\\HS\s/)) { return gib2sgf(SGF); }
	if(SGF.match(/INT\s\d+/)) { return ig12sgf(SGF); }
	if(SGF.indexOf("日本棋院ネット対局")==0) SGF = SGF.replace(/\n/g,"___");
	if(SGF.indexOf("Ver=UGF")==0) SGF = SGF.replace(/\n/g,"___");
	if(SGF.indexOf("<igo>") > 0) return SGF;
	if(SGF.indexOf("Crypt=") > 0) return SGF.replace(/\r\n/g, "___");
	if(SGF.indexOf("(;") < 0) return SGF;
	if(SGF.indexOf("B[") < 3) SGF = "(;" + SGF.substr(7).replace(/;W/, SGF.substr(1,6) + ";W");

	SGF = fixKGS(SGF);
	SGF = Markup2MK(SGF);
	SGF = contractMK(SGF);
	SGF = changeOrder(SGF);
	return(SGF);
}
// ---------------------------------------------------------


function FF4conv(str) // Convert all FF[4]
{
//	--------テキスト碁盤

	if(str.match(/┼/))
	{
		str = str.replace(/一/g,"１");
		str = str.replace(/壱/g,"１");
		str = str.replace(/①/g,"１");
		str = str.replace(/Ⅰ/g,"１");
		str = str.replace(/Ⅱ/g,"２");
		str = str.replace(/二/g,"２");
		str = str.replace(/弐/g,"２");
		str = str.replace(/②/g,"２");
		str = str.replace(/③/g,"３");
		str = str.replace(/三/g,"３");
		str = str.replace(/参/g,"３");
		str = str.replace(/Ⅲ/g,"３");
		str = str.replace(/Ⅳ/g,"４");
		str = str.replace(/四/g,"４");
		str = str.replace(/④/g,"４");
		str = str.replace(/⑤/g,"５");
		str = str.replace(/五/g,"５");
		str = str.replace(/伍/g,"５");
		str = str.replace(/Ⅴ/g,"５");
		str = str.replace(/Ⅵ/g,"６");
		str = str.replace(/六/g,"６");
		str = str.replace(/⑥/g,"６");
		str = str.replace(/⑦/g,"７");
		str = str.replace(/七/g,"７");
		str = str.replace(/Ⅶ/g,"７");
		str = str.replace(/Ⅷ/g,"８");
		str = str.replace(/八/g,"８");
		str = str.replace(/⑧/g,"８");
		str = str.replace(/九/g,"９");
		str = str.replace(/⑨/g,"９");
		str = str.replace(/Ⅸ/g,"９");
		str = str.replace(/Ⅹ/g,"10");
		str = str.replace(/⑩/g,"10");
		str = str.replace(/十/g,"10");
		str = str.replace(/拾/g,"10");

		str = str.replace(/\n/g, "___");
		return str;
	}

//	---------ネット棋院SGF対策--------

//	str = str.substring(0, str.indexOf("AB[") + 1) +
//	str.substring(str.indexOf("AB[") + 1).replace(/AB\[/g, "[");

	/*
	 * while(str.match(/AB(\[[a-z][a-z]\])+AB(\[[a-z][a-z]\])+/)){ str =
	 * str.replace(/AB((\[[a-z][a-z]\])+)AB((\[[a-z][a-z]\])+)/g, "AB$1$3"); }
	 */
	/*
	 * work = str.match(/(AB\[[a-z]{2}\]){2,}/); if(work != null){ work2 =
	 * work[0].replace(/\]AB/g, "]"); str = str.replace(work[0], work2); }
	 */
//	---------------------------------------

	str = str.replace(/(\\)\]/g, "］");
	str = str.replace(/\(\s+;/g, "\(;");


	str = str.replace(/―\]/g, "‐");
	str = str.replace(/ソ\]/g, "ゾ");
	str = str.replace(/Ы\]/g, "Ь");
	str = str.replace(/Ⅸ\]/g, "Ⅹ");
	str = str.replace(/噂\]/g, "云");
	str = str.replace(/浬\]/g, "馨");
	str = str.replace(/欺\]/g, "犠");
	str = str.replace(/圭\]/g, "珪");
	str = str.replace(/構\]/g, "江");
	str = str.replace(/蚕\]/g, "讃");
	str = str.replace(/十\]/g, "従");
	str = str.replace(/申\]/g, "疹");
	str = str.replace(/曾\]/g, "曽");
	str = str.replace(/箪\]/g, "綻");
	str = str.replace(/貼\]/g, "転");
	str = str.replace(/能\]/g, "脳");
	str = str.replace(/表\]/g, "評");
	str = str.replace(/暴\]/g, "望");
	str = str.replace(/予\]/g, "余");
	str = str.replace(/禄\]/g, "肋");
	str = str.replace(/兔\]/g, "兢");
	str = str.replace(/喀\]/g, "咯");
	str = str.replace(/媾\]/g, "嫋");
	str = str.replace(/彌\]/g, "彎");
	str = str.replace(/拿\]/g, "拆");
	str = str.replace(/杤\]/g, "枉");
	str = str.replace(/歃\]/g, "歉");
	str = str.replace(/濬\]/g, "濔");
	str = str.replace(/畚\]/g, "畩");
	str = str.replace(/秉\]/g, "秕");
	str = str.replace(/綵\]/g, "緇");
	str = str.replace(/臀\]/g, "臂");
	str = str.replace(/藹\]/g, "蘊");
	str = str.replace(/觸\]/g, "訃");
	str = str.replace(/軆\]/g, "躱");
	str = str.replace(/鐔\]/g, "鐓");
	str = str.replace(/饅\]/g, "饐");
	str = str.replace(/鷭\]/g, "鷯");
	str = str.replace(/偆\]/g, "偰");
	str = str.replace(/砡\]/g, "硎");
	str = str.replace(/犱\]/g, "・");
	str = str.replace(/纊\]/g, "褜");
	str = str.replace(/犾\]/g, "猤");
	str = str.replace(/―\[/g, "ー");
	str = str.replace(/ソ\[/g, "ゼ");
	str = str.replace(/Ы\[/g, "Ъ");
	str = str.replace(/Ⅸ\[/g, "Ⅷ");
	str = str.replace(/噂\[/g, "閏");
	str = str.replace(/浬\[/g, "骸");
	str = str.replace(/欺\[/g, "擬");
	str = str.replace(/圭\[/g, "啓");
	str = str.replace(/構\[/g, "梗");
	str = str.replace(/蚕\[/g, "纂");
	str = str.replace(/十\[/g, "充");
	str = str.replace(/申\[/g, "深");
	str = str.replace(/曾\[/g, "措");
	str = str.replace(/箪\[/g, "端");
	str = str.replace(/貼\[/g, "甜");
	str = str.replace(/能\[/g, "納");
	str = str.replace(/表\[/g, "票");
	str = str.replace(/暴\[/g, "房");
	str = str.replace(/予\[/g, "夕");
	str = str.replace(/鰐\[/g, "鰐");
	str = str.replace(/兔\[/g, "兌");
	str = str.replace(/喀\[/g, "喙");
	str = str.replace(/媾\[/g, "媼");
	str = str.replace(/彌\[/g, "彈");
	str = str.replace(/拿\[/g, "拏");
	str = str.replace(/杤\[/g, "杣");
	str = str.replace(/歃\[/g, "歇");
	str = str.replace(/濬\[/g, "濕");
	str = str.replace(/畚\[/g, "畆");
	str = str.replace(/秉\[/g, "禺");
	str = str.replace(/綵\[/g, "綣");
	str = str.replace(/臀\[/g, "膽");
	str = str.replace(/藹\[/g, "藜");
	str = str.replace(/觸\[/g, "觴");
	str = str.replace(/軆\[/g, "躰");
	str = str.replace(/鐔\[/g, "鐚");
	str = str.replace(/饅\[/g, "饉");
	str = str.replace(/鷭\[/g, "鷦");
	str = str.replace(/偆\[/g, "倞");
	str = str.replace(/砡\[/g, "劯");

	str = str.replace(/([^(]);(FF|G[CMN]|A[PBW]|RU|SZ|HA|KM|TM|P[BCW]|BR|WR|R[EO]|DT|EV)\[/g, "$1$2\[");
	str = str.replace(/;\r\nP([BW])/g, "\r\nP$1");

//	SGF一般
	while((indx = str.indexOf("C[")) > -1)
	{
		kk = str.substring(indx + 2);

		if((s = kk.indexOf("]")) < 0) { break; }

		tmp = "ff4ff" + kk.substring(0, s);
		tmp = tmp.replace(/\\\r\n/g, "");
		tmp = tmp.replace(/([―ソЫⅨ噂浬欺圭構蚕十申曾箪貼能表暴予禄兔喀媾彌拿杤歃濬畚秉綵臀藹觸軆鐔饅鷭偆砡犱纊犾])\\/g, "$1");

		tmp = tmp.replace(/\n/g, "___");
		tmp = tmp.replace(/'/g, "’");
		tmp = tmp.replace(/"/g, '”');
		tmp = tmp.replace(/;/g, '；');
		tmp = tmp.replace(/\\\[/g, "［");
		tmp = tmp.replace(/\\\]/g, "］");
		tmp = tmp.replace(/\[/g, "［");
		tmp = tmp.replace(/\]/g, "］");
		tmp = tmp.replace(/\\\\/g, "\\");
		tmp = tmp.replace(/\(/g, "（");
		tmp = tmp.replace(/\)/g, "）");
		tmp = tmp.replace(/\\/g, "￥");

		str = str.substring(0, indx) + tmp +
		str.substring(kk.substring(0, s).length + indx + 2);
	}

	return str.replace(/ff4ff/g, "C[");
}

