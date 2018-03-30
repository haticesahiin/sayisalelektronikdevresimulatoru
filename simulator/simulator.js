var Simulator;
(function (Simulator) {
    var connection = (function () {
        function connection() {
            this.value = false;
        }
        return connection;
    })();
    Simulator.connection = connection;
    var bilesen = (function () {
        function bilesen(inputSize, outputSize) {
            this.inputs = new Array();
            this.inputValue = new Array();
            for (var i = 0; i < inputSize; ++i) {
                this.inputs.push(undefined);
                this.inputValue.push(false);
            }
            this.outputs = new Array();
            this.outputValue = new Array();
            for (var i = 0; i < outputSize; ++i) {
                this.outputs.push(Array());
                this.outputValue.push(false);
            }
        }
        bilesen.prototype.setInput = function (index, conn) {
           
            this.inputs[index] = conn;
            conn.next = this;
        };
        bilesen.prototype.setOutput = function (index, conn) {
           
            this.outputs[index].push(conn);
        };
        bilesen.prototype.removeInput = function (index) {
           
            this.inputs[index] = undefined;
        };
        bilesen.prototype.removeOutput = function (index, conn) {
            
            var toRemove = this.outputs[index].indexOf(conn);
            if (toRemove == -1) {
                throw "hata!";
            }
            else {
                this.outputs[index].splice(toRemove, 1);
            }
        };
        bilesen.prototype.update = function () {
            var canUpdate = true;
            for (var i = 0; i < this.inputs.length; ++i) {
                if (this.inputs[i] == undefined || this.inputs[i].value == undefined) {
                    canUpdate = false;
                }
                else {
                    this.inputValue[i] = this.inputs[i].value;
                }
            }
            if (canUpdate) {
                console.log(this.name + " güncellendi");
                this.evaluate();
                for (var i = 0; i < this.outputs.length; ++i) {
                    for (var j = 0; j < this.outputs[i].length; ++j) {
                        this.outputs[i][j].value = this.outputValue[i];
                        this.outputs[i][j].next.update();
                    }
                }
            }
        };
        return bilesen;
    })();
    Simulator.bilesen = bilesen;
    var activebilesenler = {};
    function getbilesen(name) {
        if (activebilesenler[name] == undefined) {
            throw "bilesen doesn't exist!";
        }
        return activebilesenler[name];
    }
    Simulator.getbilesen = getbilesen;
    function addbilesen(name, bilesen) {
        if (activebilesenler[name] != undefined) {
            throw "Name already taken!";
        }
        activebilesenler[name] = bilesen;
    }
    Simulator.addbilesen = addbilesen;
    function connect(from, fromIdx, to, toIdx) {
        var conn = new connection;
        console.log(from);
        console.log(to);
        from.setOutput(fromIdx, conn);
        to.setInput(toIdx, conn);
        from.update();
    }
    Simulator.connect = connect;
    function disconnect(from, fromIdx, to, toIdx) {
        from.removeOutput(fromIdx, to.inputs[toIdx]);
        to.removeInput(toIdx);
    }
    Simulator.disconnect = disconnect;
})(Simulator || (Simulator = {}));
var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var bilesenler;
(function (bilesenler) {//bağlantı kablo ve noktalarının özellikleri
    var linkColor = "blue";
    var outputEndpoint = {//çıkıs noktası
        endpoint: ["Dot", { radius: 8 }],//yuvarlaklığı
        paintStyle: { fillStyle: linkColor },
        isTarget: true,
        isSource: true,
        scope: "logicconnections",
        connectorStyle: { strokeStyle: linkColor, lineWidth: 6 },
        connector: ["Flowchart", {}],
        maxconnections: 10
    };
    var inputEndpoint = {//giriş noktaları
        endpoint: ["Dot", { radius: 8 }],
        paintStyle: { fillStyle: linkColor },
        isTarget: true,
        scope: "logicconnections",
        connectorStyle: { strokeStyle: linkColor, lineWidth: 6 },
        connector: ["Flowchart", {}],
        maxconnections: 1 //max bağlanti sayısı
    };
    var HTMLbilesen = (function (_super) {//bileşenleri tutan değişken butona basınca ekrana gelecek elemanın divini oluşturur, yerleştirimi
        __extends(HTMLbilesen, _super);// (_super) değişkeniyle  htmlbileşeni değişkenini __extends sınıfına yolladım
        function HTMLbilesen(nInputs, nOutputs, posx, posy, bilesenName) {//giriş sayisi,cıkıs sayısı,x,y konumu ,bileşen adı
            _super.call(this, nInputs, nOutputs);
            this.contDiv = $("<div id=" + this.name + "></div>").addClass("bilesen").addClass(bilesenName);
            $("#screen").append(this.contDiv);//sonuna ekler
            var spos = $("#screen").offset();
            Simulator.addbilesen(this.name, this);
            this.contDiv.offset({ top: spos.top + posy, left: spos.left + posx });//pozisyon
            jsPlumb.draggable(this.contDiv, { containment: $("#screen") });//ekran içinde sürüklenebilirlik (hareketlilik)
        }
        return HTMLbilesen;
    })(Simulator.bilesen);
    var dugme = (function (_super) {//duğme elemanını tanımlar 
        __extends(dugme, _super);
        function dugme(posx, posy) {//pozisyonu
            this.name = dugme.bilesenName + dugme.bilesenCount;//ekrana kac tane dugme oldugunu id kullanarak bulur.
            dugme.bilesenCount += 1;//bir kere daha tıklarsak id 1 artıracak
            this.value = false;//dugme 0 konumunda
            _super.call(this, 0, 1, posx, posy, dugme.bilesenName);//htmlbilesen 
            this.contDiv.append($("<img src=\"simulator/kapilar/dugme_off.png\"></>"));//img tagı ekledim ve yolunu verdim
            this.contDiv.click({ parent: this }, function (event) {//tıklandığında hangi resmin geleceğine karar verir
                if (event.data.parent.value) {
                    event.data.parent.value = false;
                    event.data.parent.contDiv.children("img").attr("src", "simulator/kapilar/dugme_off.png");
                }
                else {
                    event.data.parent.value = true;
                    event.data.parent.contDiv.children("img").attr("src", "simulator/kapilar/dugme_on.png");
                }
                event.data.parent.update();//güncelliyorum
            });
            jsPlumb.addEndpoint(this.contDiv, { anchor: "Bottom" }, outputEndpoint).id = this.name + "-o0";//çıkışına isim verdim
            this.evaluate = function () {
                this.outputValue[0] = this.value;// 1 mi 0 mı diye tuttum 
            };
        }
        dugme.bilesenCount = 0;//id 
        dugme.bilesenName = "dugme";
        return dugme;
    })(HTMLbilesen);
    bilesenler.dugme = dugme;
    var lamba = (function (_super) {
        __extends(lamba, _super);
        function lamba(posx, posy) {
            this.name = lamba.bilesenName + lamba.bilesenCount;
            lamba.bilesenCount += 1;
            _super.call(this, 1, 0, posx, posy, lamba.bilesenName);
            this.contDiv.append($("<img src=\"simulator/kapilar/lamba_off.png\"></>"));
            jsPlumb.addEndpoint(this.contDiv, { anchor: "Left" }, inputEndpoint).id = this.name + "-i0";
            this.evaluate = function () {
                if (this.inputValue[0]) {
                    this.contDiv.children("img").attr("src", "simulator/kapilar/lamba_on.png");
                }
                else {
                    this.contDiv.children("img").attr("src", "simulator/kapilar/lamba_off.png");
                }
            };
        }
        lamba.prototype.removeInput = function (index) {
            _super.prototype.removeInput.call(this, index);
            this.contDiv.children("img").attr("src", "simulator/kapilar/lamba_off.png");
        };
        lamba.bilesenCount = 0;
        lamba.bilesenName = "lamba";
        return lamba;
    })(HTMLbilesen);
    bilesenler.lamba = lamba;
 
    var Not = (function (_super) {
        __extends(Not, _super);
        function Not(posx, posy) {
            Not.bilesenName = "not";
            this.name = Not.bilesenName + Not.bilesenCount;
            Not.bilesenCount += 1;
            _super.call(this, 1, 1, posx, posy, Not.bilesenName);
            this.contDiv.append($("<img src=\"simulator/kapilar\\" + Not.bilesenName + ".png\"></>"));
            jsPlumb.addEndpoint(this.contDiv, { anchor: "Left" }, inputEndpoint).id = this.name + "-i0";
            jsPlumb.addEndpoint(this.contDiv, { anchor: "Right" }, outputEndpoint).id = this.name + "-o0";
            this.evaluate = function () {
                this.outputValue[0] = !this.inputValue[0];//giriş degerinin değilini aldım çıkışa eşitledim
            };
        }
        Not.bilesenCount = 0;
        
        return Not;
    })(HTMLbilesen);
    bilesenler.Not = Not;
    var Or = (function (_super) {
        __extends(Or, _super);
        function Or(posx, posy) {
            this.name = Or.bilesenName + Or.bilesenCount;
            Or.bilesenCount += 1;
            _super.call(this, 2, 1, posx, posy, Or.bilesenName);
            this.contDiv.append($("<img src=\"simulator/kapilar\\" + Or.bilesenName + ".png\"></>"));
            jsPlumb.addEndpoint(this.contDiv, { anchor: [0, 0.3, 0, 0] }, inputEndpoint).id = this.name + "-i0";
            jsPlumb.addEndpoint(this.contDiv, { anchor: [0, 0.7, 0, 0] }, inputEndpoint).id = this.name + "-i1";
            jsPlumb.addEndpoint(this.contDiv, { anchor: "Right" }, outputEndpoint).id = this.name + "-o0";
            this.evaluate = function () {
                this.outputValue[0] = this.inputValue[0] || this.inputValue[1];//giriş değerlerini or ladım çıkışa eşitledim
            };
        }
        Or.bilesenCount = 0;
        Or.bilesenName = "or";
        return Or;
    })(HTMLbilesen);
    bilesenler.Or = Or;

    var Or3 = (function (_super) {
        __extends(Or3, _super);
        function Or3(posx, posy) {
            this.name = Or3.bilesenName + Or3.bilesenCount;
            Or3.bilesenCount += 1;
            _super.call(this, 3, 1, posx, posy, Or3.bilesenName);
            this.contDiv.append($("<img src=\"simulator/kapilar\\" + Or3.bilesenName + ".png\"></>"));
            jsPlumb.addEndpoint(this.contDiv, { anchor: [0, 0.2, 0, 0] }, inputEndpoint).id = this.name + "-i0";//noktaların benzersiz isimlendirilmesi için
            jsPlumb.addEndpoint(this.contDiv, { anchor: [0, 0.5, 0, 0] }, inputEndpoint).id = this.name + "-i1";
            jsPlumb.addEndpoint(this.contDiv, { anchor: [0, 0.8, 0, 0] }, inputEndpoint).id = this.name + "-i2";
            jsPlumb.addEndpoint(this.contDiv, { anchor: "Right" }, outputEndpoint).id = this.name + "-o0";
            this.evaluate = function () {
                this.outputValue[0] = this.inputValue[0] || this.inputValue[1] || this.inputValue[2];//girişleri orladım çıkışa eşitledim
            };
        }
        Or3.bilesenCount = 0;
        Or3.bilesenName = "or3";
        return Or3;
    })(HTMLbilesen);
    bilesenler.Or3 = Or3;
     
    var Xor = (function (_super) {
        __extends(Xor, _super);
        function Xor(posx, posy) {
            this.name = Xor.bilesenName + Xor.bilesenCount;
            Xor.bilesenCount += 1;
            _super.call(this, 2, 1, posx, posy, Xor.bilesenName);
            this.contDiv.append($("<img src=\"simulator/kapilar\\" + Xor.bilesenName + ".png\"></>"));
            jsPlumb.addEndpoint(this.contDiv, { anchor: [0, 0.3, 0, 0] }, inputEndpoint).id = this.name + "-i0";
            jsPlumb.addEndpoint(this.contDiv, { anchor: [0, 0.7, 0, 0] }, inputEndpoint).id = this.name + "-i1";
            jsPlumb.addEndpoint(this.contDiv, { anchor: "Right" }, outputEndpoint).id = this.name + "-o0";
            this.evaluate = function () {
                this.outputValue[0] = this.inputValue[0] ^ this.inputValue[1];//xor işlemi
            };
        }
        Xor.bilesenCount = 0;
        Xor.bilesenName = "xor";
        return Xor;
    })(HTMLbilesen);
    bilesenler.Xor = Xor;
    var And = (function (_super) {
        __extends(And, _super);
        function And(posx, posy) {
            this.name = And.bilesenName + And.bilesenCount;
            And.bilesenCount += 1;
            _super.call(this, 2, 1, posx, posy, And.bilesenName);
            this.contDiv.append($("<img src=\"simulator/kapilar\\" + And.bilesenName + ".png\"></>"));
            jsPlumb.addEndpoint(this.contDiv, { anchor: [0, 0.3, 0, 0] }, inputEndpoint).id = this.name + "-i0";
            jsPlumb.addEndpoint(this.contDiv, { anchor: [0, 0.7, 0, 0] }, inputEndpoint).id = this.name + "-i1";
            jsPlumb.addEndpoint(this.contDiv, { anchor: "Right" }, outputEndpoint).id = this.name + "-o0";
            this.evaluate = function () {
                this.outputValue[0] = this.inputValue[0] && this.inputValue[1];
            };
        }
        And.bilesenCount = 0;
        And.bilesenName = "and";
        return And;
    })(HTMLbilesen);
    bilesenler.And = And;

var And3 = (function (_super) {
        __extends(And3, _super);
        function And3(posx, posy) {
            this.name = And3.bilesenName + And3.bilesenCount;
            And3.bilesenCount += 1;
            _super.call(this, 3, 1, posx, posy, And3.bilesenName);
            this.contDiv.append($("<img src=\"simulator/kapilar\\" + And3.bilesenName + ".png\"></>"));
            jsPlumb.addEndpoint(this.contDiv, { anchor: [0, 0.2, 0, 0] }, inputEndpoint).id = this.name + "-i0";
            jsPlumb.addEndpoint(this.contDiv, { anchor: [0, 0.5, 0, 0] }, inputEndpoint).id = this.name + "-i1";
            jsPlumb.addEndpoint(this.contDiv, { anchor: [0, 0.8, 0, 0] }, inputEndpoint).id = this.name + "-i2";
            jsPlumb.addEndpoint(this.contDiv, { anchor: "Right" }, outputEndpoint).id = this.name + "-o0";
            this.evaluate = function () {
                this.outputValue[0] = this.inputValue[0] && this.inputValue[1] && this.inputValue[2];
            };
        }
        And3.bilesenCount = 0;
        And3.bilesenName = "and3";
        return And3;
    })(HTMLbilesen);
    bilesenler.And3 = And3;
})(bilesenler || (bilesenler = {}));//ekranda olanları tutuyor 

jsPlumb.ready(function () {//hazır oldugunda ekrana 
    jsPlumb.setContainer($("#screen"));
    jsPlumb.doWhileSuspended(function () {
        jsPlumb.bind("connection", function (info, originalEvent) {//bağlantı oluşumu
            var sourceid = info.source.id;//bağlantının basladıgı yerin id si
            var targetid = info.target.id;
            var sourceepid = +(info.sourceEndpoint.id.split("-")[1].substring(1));
            var targetepid = +(info.targetEndpoint.id.split("-")[1].substring(1));
         
            Simulator.connect(Simulator.getbilesen(sourceid), sourceepid, Simulator.getbilesen(targetid), targetepid);
        });
        jsPlumb.bind("connectionDetached", function (info, originalEvent) {//bağlantının koparılması
            var sourceid = info.source.id;
            var targetid = info.target.id;
            var sourceepid = +(info.sourceEndpoint.id.split("-")[1].substring(1));
            var targetepid = +(info.targetEndpoint.id.split("-")[1].substring(1));
            
            Simulator.disconnect(Simulator.getbilesen(sourceid), sourceepid, Simulator.getbilesen(targetid), targetepid);
           
        });
        jsPlumb.bind("connectionMoved", function (info, originalEvent) {//bağlantıyı tasıma
            var sourceid = info.originalSourceId;
            var targetid = info.originalTargetId;
            var sourceepid = +(info.originalSourceEndpoint.id.split("-")[1].substring(1));
            var targetepid = +(info.originalTargetEndpoint.id.split("-")[1].substring(1));
            
            Simulator.disconnect(Simulator.getbilesen(sourceid), sourceepid, Simulator.getbilesen(targetid), targetepid);
           
        });
    });
});
