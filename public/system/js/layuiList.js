(function (global) {
    var layList = {
        table: null,
        laydate: null,
        layer: null,
        form: null,
        tableIns: null,
        laypage:null,
        element:null,
        elemOdj:[],
        boxids:'ids',
        odj:'',
        initialize: function () {
            var that = this;
            layui.use(['form','table', 'laydate', 'layer', 'laypage','element'], function () {
                that.form = layui.form;
                that.table = layui.table;
                that.laydate = layui.laydate;
                that.layer = layui.layer;
                that.laypage =layui.laypage;
                that.element = layui.element;
            })
            $('.layui-input-block').each(function () {
                var name = $(this).data('type');
                if ($(this).data('type') != undefined) {
                    var input = $(this).find('input[name="' + name + '"]');
                    $(this).children('button').each(function () {
                        $(this).on('click', function () {
                            $(this).removeClass('layui-btn-primary').siblings().addClass('layui-btn-primary');
                            input.val($(this).data('value'));
                        })
                    });
                }
            });
        },
        inintclass: function ($names) {
            var that=this;
            $names.find('button').each(function() {
                var type = $names.data('type');
                $(this).on('click',function () {
                    var value=$(this).data('value');
                    $(this).addClass('layui-btn-radius').siblings().removeClass('layui-btn-primary');
                    $names.find('input[name="'+type+'"]').val(value);
                    that.reload({[type]:value})
                })
            });
        }
    };
    //ajax POST
    layList.basePost = function (url, data, successCallback, errorCallback) {
        var that = this;
        $.ajax({
            headers: this.headers(),
            url: url,
            data: data,
            type: 'post',
            dataType: 'json',
            success: function (rem) {
                if (rem.code == 200 || rem.status == 200)
                    successCallback && successCallback(rem);
                else
                    errorCallback && errorCallback(rem);
            },
            error: function (err) {
                errorCallback && errorCallback(err);
                that.msg(err);
            }
        })
    }
    //ajax GET
    layList.baseGet = function (url,successCallback, errorCallback) {
        var that = this;
        $.ajax({
            headers: this.headers(),
            url: url,
            type: 'get',
            dataType: 'json',
            success: function (rem) {
                if (rem.code == 200 || rem.status == 200)
                    successCallback && successCallback(rem);
                else
                    errorCallback && errorCallback(rem);
            },
            error: function (err) {
                errorCallback && errorCallback(err);
                that.msg('???????????????');
            }
        });
    };
    //??????headers???
    layList.headers = function () {
        return {
            'Content-Type': 'application/x-www-form-urlencoded',
            'X-Requested-With': 'XMLHttpRequest',
        };
    };
    //????????? layui table
    layList.tableList = function (odj, url, data, limit, size,boxids,is_tables) {
        var limit = limit || 20, size = size || 'lg', $data = [], that = this,boxids=boxids || this.boxids;
        switch (typeof data) {
            case 'object':
                $data = data;
                break;
            case "function":
                data && ($data = data());
                break;
        }
        if(is_tables!=true) this.odj=odj;
        if(that.elemOdj[odj]==undefined) that.elemOdj[odj]=odj;
        var elemOdj=that.elemOdj[this.odj];
        console.log(that.elemOdj);
        that.tableIns = that.table.render({
            id:boxids,
            elem: '#' +elemOdj,
            url: url,
            page: true,
            limit: limit,
            size: size,
            cols: [$data]
        });
        return that.tableIns;
    };
    //??????url PHP?????????????????? ????????????
    layList.Url = function (opt) {
        var m = opt.m || window.module, c = opt.c || window.controlle, a = opt.a || 'index', q = opt.q || '',
            p = opt.p || {}, params = '';
        params = Object.keys(p).map(function (key) {
            return key + '/' + p[key];
        }).join('/');
        gets = Object.keys(q).map(function (key) {
            return key+'='+ q[key];
        }).join('&');

        return '/' + m + '/' + c + '/' + a + (params == '' ? '' : '/' + params) + (gets == '' ? '' : '?' + gets);
    };
    layList.U=function(obj){
        return this.Url(obj);
    }
    //???????????? where ???????????? join,page ????????????????????????,tableIns ???table??? this.tableList ???????????????
    layList.reload = function (where, page, tableIns,initSort) {
        var whereOdJ = {where: where || {}};
        if (initSort) whereOdJ.initSort = initSort;
        if (page == true) whereOdJ.page = {curr: 1};
        if(typeof tableIns=='Object'){
            tableIns.reload(whereOdJ);
        }else{
            console.log(whereOdJ);
            this.tableIns.reload(whereOdJ);
        }
    }
    //?????????????????????
    layList.order = function (type, filde) {
        switch (type) {
            case 'desc':
                return filde + '-desc';
                break;
            case 'asc':
                return filde + '-asc';
                break;
            case null:
                return '';
                break;
        }
    }
    //????????????
    layList.tool = function (EventFn, fieldStr,odjs) {
        var that = this;
        // var elemOdj=elemOdj || that.elemOdj
        var elemOdj=that.elemOdj[odjs || this.odj];
        console.log(elemOdj);
        this.table.on('tool(' + elemOdj + ')', function (obj) {
            console.log(obj)
            var data = obj.data, layEvent = obj.event;
            if (typeof EventFn == 'function') {
                EventFn(layEvent, data,obj);
            } else if (EventFn && (typeof fieldStr == 'function')) {
                switch (layEvent) {
                    case EventFn:
                        fieldStr(data);
                        break;
                    default:
                        console.log('?????????????????????');
                        break
                }
            }
        });
    }
    //???????????? EventFn ?????????????????? || ??????,page ???????????????1???,tableIns ???table??? this.tableList ???????????????
    layList.sort = function (EventFn, page,tableIns,odj) {
        var that = this;
        // var elemOdj=elemOdj || that.elemOdj;
        var elemOdj=that.elemOdj[odj || this.odj];
        this.table.on('sort(' + elemOdj + ')', function (obj) {
            var layEvent = obj.field;
            var type = obj.type;
            if (typeof EventFn == 'function') {
                EventFn(obj);
            } else if (typeof EventFn=='object'){
                for(value in EventFn){
                    switch (layEvent) {
                        case EventFn[value]:
                            if (page == true)
                                that.reload({order: that.order(type, EventFn[value])}, true, tableIns, obj);
                            else
                                that.reload({order: that.order(type, EventFn[value])}, null, tableIns, obj);
                            continue;
                    }
                }
            }else if(EventFn){
                switch (layEvent) {
                    case EventFn:
                        if (page == true)
                            that.reload({order: that.order(type, EventFn)}, true, tableIns, obj);
                        else
                            that.reload({order: that.order(type, EventFn)}, null, tableIns, obj);
                        break;
                    default:
                        console.log('?????????????????????');
                        break
                }
            }
        });
    }
    layList.msg = function (msg) {
        var msg = msg || '????????????';
        try {
            return this.layer.msg(msg);
        } catch (e) {
            console.log(e);
        }
    }
    //???????????????
    layList.date = function (IdName) {
        if (typeof IdName == 'string' && $('#' + IdName).length == 0) return console.info('????????????????????????');
        var json = typeof IdName == 'object' ? IdName : {elem: '#' + IdName, range: true};
        this.laydate.render(json);
    }
    //???????????????
    layList.switch = function (switchname, successFn) {
        this.form.on('switch(' + switchname + ')', function (obj) {
            successFn && successFn(obj, this.value, this.name);
        });
    }
    //??????select
    layList.select = function (switchname, successFn) {
        this.form.on('select(' + switchname + ')', function (obj) {
            successFn && successFn(obj, this.value, this.name);
        });
    }
    //??????????????????????????????
    layList.getCheckData = function (boxids) {
        var boxids = boxids || this.boxids;
        return this.table.checkStatus(boxids).data;
    }
    //??????
    layList.search = function (btnname, successFn) {
        var name = typeof btnname == 'string' ? btnname : '';
        var that = this;
        if (name == '') return false;
        this.form.on('submit(' + btnname + ')', function (data) {
            if (typeof successFn == "function") {
                successFn(data.field);
            } else {
                that.reload(data.field);
            }
            return false;
        })
    }
    layList.codeType = function (name, type) {
        switch (name) {
            // case :
        }
    }
    layList.edit=function(name,successFn,odj){
        var that = this;
        var elemOdj=that.elemOdj[odj || this.odj];
        this.table.on('edit('+elemOdj+')',function (obj) {
            var value = obj.value //?????????????????????
                ,data = obj.data //???????????????????????????
                ,field = obj.field; //????????????
            switch (field){
                case name:
                    successFn && successFn(obj);
                    break;
                default:
                    console.log('????????????????????????'+name);
                    break;
            }
        });
    }
    //???????????????table???????????????????????????
    layList.tables=function(odj,data,value,successFn){
        var url=data.url || '',limit=data.limit || 20,size=data.size || 'lg',that=this;
        this.tableList(odj,url,value,limit,size);
    }
    layList.createModalFrame=function(title,src,opt){
        opt === undefined && (opt = {});
        var area=[(opt.w || 750)+'px', (opt.h || 680)+'px'];
        // $(window).resize(function() {
        //     $('.layui-layer-iframe').css('top',);
        // });
        // $('.layui-layer-iframe').on('mousedown',function () {
        //     console.log($(document).height());
        // })
        return this.layer.open({
            type: 2,
            title:title,
            area: area,
            fixed: false, //?????????
            maxmin: true,
            moveOut:false,//true  ??????????????????  false ??????????????????
            anim:5,//???????????? isOutAnim bool ????????????
            offset:'auto',//['100px','100px'],//'auto',//????????????  ['100px','100px'] t[ ??? ???]
            shade:0,//??????
            resize:true,//??????????????????
            content: src,//??????
            move:'.layui-layer-title',// ??????".layui-layer-title",// ?????????????????????
            moveEnd:function(){//??????????????????
                console.log(this);
            }
        });
    };

    //????????????
    Array.prototype.getIds = function (field) {
        var ids = [];
        $.each(this, function (name, value) {
            if (value[field] != undefined) ids.push(value[field]);
        });
        return ids;
    }
    //?????????layui
    layList.initialize();

    global.layList = layList;

    return layList;
}(this));