function handleMou() {
	tt = doc.getElementById("divTooltip");
	tt.style.display = "none";
};

function handleLoad() {
	doc = document;

	doc.onmouseout = handleMou;
	doc.editNotView = false;

	srcdoc = doc.getElementById("iframeSrc").contentDocument;
};

function nsResolver(prefix) {
	return "http://www.mpsitech.com/wznm";
};

function retrieveNodeField(srcdoc, node, sref) {
	var res, resnode;

	res = srcdoc.evaluate("wznm:" + sref, node, nsResolver, XPathResult.ANY_TYPE, null);
	resnode = res.iterateNext();

	if (resnode) return resnode.textContent;
	else return "";
};

function toggleEdit() {
	doc.editNotView = !doc.editNotView;
};

function exportBoxs() {
	var res, resnode;
	var mytxa;

	var boxs = "";

	res = srcdoc.evaluate("//wznm:src/wznm:ListWznmQVisBoxctx/wznm:row", srcdoc, nsResolver, XPathResult.ANY_TYPE, null);
	resnode = res.iterateNext();
	while (resnode) {
		boxs += retrieveNodeField(srcdoc, resnode, "stubUnv") + "\t" + retrieveNodeField(srcdoc, resnode, "x") + "\t" + retrieveNodeField(srcdoc, resnode, "y") + "\n";
		resnode = res.iterateNext();
	};

	if (boxs == "") return;

	mytxa = doc.createElementNS("http://www.w3.org/1999/xhtml", "html:textarea");
	
	mytxa.value = boxs;

	doc.body.appendChild(mytxa);
	mytxa.select();
	doc.execCommand("copy");
	doc.body.removeChild(mytxa);
};

function handleKdn(ev) {
	if ((ev.keyCode == 0x45) || (ev.keyCode == 0x65)) toggleEdit(); // E/e
	else if ((ev.keyCode == 0x58) || (ev.keyCode == 0x78)) exportBoxs(); // X/x

	return false;
};

function handleBoxMdn(_doc, evt, jnum) {
	if (!doc.editNotView) return;

	var res, resnode;

	// retrieve box context
	res = srcdoc.evaluate("//wznm:src/wznm:ListWznmQVisBoxctx/wznm:row[@jnum=" + jnum + "]", srcdoc, nsResolver, XPathResult.ANY_TYPE, null);
	resnode = res.iterateNext();

	if (resnode) {
		doc.x0 = parseInt(retrieveNodeField(srcdoc, resnode, "x"));

		doc.x = doc.x0;
		doc.y = parseInt(retrieveNodeField(srcdoc, resnode, "y"));

		doc.xofs = evt.clientX - doc.x;
		doc.yofs = evt.clientY - doc.y;
	};

	_doc.getElementById("box" + jnum).setAttribute("onmousemove", "handleBoxMove(event," + jnum + ")");
	_doc.getElementById("box" + jnum).setAttribute("onmouseup", "handleBoxMup(event," + jnum + ")");
}

function handleBoxMove(_doc, evt, jnum) {
	doc.x = evt.clientX - doc.xofs;
	doc.y = evt.clientY - doc.yofs;

	_doc.getElementById("box" + jnum).setAttribute("transform", "translate(" + doc.x + "," + doc.y + ")");
};

function handleBoxMup(_doc, jnum) {
	_doc.getElementById("box" + jnum).setAttribute("transform", "translate(" + doc.x0 + "," + doc.y + ")");

	_doc.getElementById("box" + jnum).onmousemove = null;
	_doc.getElementById("box" + jnum).onmouseup = null;

	var res, resnode;

	// retrieve box context
	res = srcdoc.evaluate("//wznm:src/wznm:ListWznmQVisBoxctx/wznm:row[@jnum=" + jnum + "]/wznm:x", srcdoc, nsResolver, XPathResult.ANY_TYPE, null);
	resnode = res.iterateNext();
	if (resnode) {
		resnode.replaceChild(srcdoc.createTextNode(doc.x0), resnode.firstChild);

		res = srcdoc.evaluate("//wznm:src/wznm:ListWznmQVisBoxctx/wznm:row[@jnum=" + jnum + "]/wznm:y", srcdoc, nsResolver, XPathResult.ANY_TYPE, null);
		resnode = res.iterateNext();
		if (resnode) resnode.replaceChild(srcdoc.createTextNode(doc.y), resnode.firstChild);
	};
};

function handleRowMov(event, jnum, jnumBox) {
	var rowctx, tt;
	var res, resnode;
	var hdr, subhdr, cont;

	if (window.event) event = window.event;

	// retrieve row context
	res = srcdoc.evaluate("//wznm:src/wznm:ListWznmQVisRowctx/wznm:row[@jnum=" + jnum + "]", srcdoc, nsResolver, XPathResult.ANY_TYPE, null);
	resnode = res.iterateNext();

	rowctx = "";
	if (resnode) {
		hdr = retrieveNodeField(srcdoc, resnode, "cnt1");
		subhdr = retrieveNodeField(srcdoc, resnode, "cnt2");
		cont = retrieveNodeField(srcdoc, resnode, "cnt3");

		if (cont != "") {
			cont = cont.replace(/;/g, "<br>");
			rowctx = cont;
			if ((hdr != "") || (subhdr != "")) rowctx = "<br><br>" + rowctx;
		};

		if (subhdr != "") rowctx = "<em>" + subhdr + "</em>" + rowctx;

		if (hdr != "") {
			hdr = "<strong>" + hdr + "</strong>";
			if (subhdr != "") hdr += "<br>";
			
			rowctx = hdr + rowctx;
		};
	};

	tt = doc.getElementById("divTooltip");

	if (rowctx == "") {
		tt.style.display = "none";
		return;
	};

	doc.getElementById("tdTooltip").innerHTML = rowctx;

	tt.style.left = event.clientX + 10 + "px";
	tt.style.top = event.clientY - 10 + "px";

	tt.style.display = "block";
};

function handleRowMou(jnum, jnumBox) {
	tt = doc.getElementById("divTooltip");
	tt.style.display = "none";
};

var boxctx;

function addIme(jnumBox, descend) {
	var res, resnode;
	var s;
	var vec;

	// retrieve box context
	res = srcdoc.evaluate("//wznm:src/wznm:ListWznmQVisBoxctx/wznm:row[@jnum=" + jnumBox + "]", srcdoc, nsResolver, XPathResult.ANY_TYPE, null);
	resnode = res.iterateNext();

	if (resnode) {
		s = retrieveNodeField(srcdoc, resnode, "cnt1");
		boxctx += s.replace(/;/g, "\t") + "\n";

		if (descend) {
			s = retrieveNodeField(srcdoc, resnode, "sub");

			if (s != "") {
				vec = s.split(";");
				for (var i = 0; i < vec.length; i++) addIme(vec[i], true);
			};
		};

		s = retrieveNodeField(srcdoc, resnode, "cnt2");
		boxctx += s.replace(/;/g, "\t") + "\n";
	};
};

function handleRowClick(event, jnum, jnumBox, num) {
	var mytxa;

	boxctx = "";

	addIme(jnumBox, num == 2);

	if (boxctx == "") return;

	mytxa = doc.createElementNS("http://www.w3.org/1999/xhtml", "html:textarea");
	
	mytxa.value = boxctx;

	doc.body.appendChild(mytxa);
	mytxa.select();
	doc.execCommand("copy");
	doc.body.removeChild(mytxa);
};
