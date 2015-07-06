/**
 * окно параметров регистрации
 */

$p.iface.registration_prm = function(v){

	var wnd = $p.iface.w.createWindow('wnd_registration_prm', 0, 0, 480, 200),
		str = [
			{ type:"settings" , labelWidth:100, inputWidth:300, offsetLeft:"20", offsetTop:"20"  },
			{ type:"combo" , name:"cb_division", label:"Подразделение"   },
			{ type:"combo" , name:"cb_employee", label:"Исполнитель"  },
			{ type:"button" , name:"btn_ok", value:"Ок"  }
		],
		frm_registration_prm = wnd.attachForm(str);

	wnd.setText('Параметры регистрации');
	wnd.centerOnScreen();
	wnd.button('park').hide();
	wnd.button('minmax').hide();
	wnd.setModal(1);

	frm_registration_prm.attachEvent("onButtonClick", function(name){
		wnd.close();
	});

	var cb_division = frm_registration_prm.getCombo("cb_division");
	cb_division.load($p.wsql.get_user_param("pl_hs_url") + "/q/combo_division", function(){
		if(v.current_division){
			this.setComboValue(v.current_division);
		}
	});
	cb_division.enableFilteringMode("between", $p.wsql.get_user_param("pl_hs_url") + "/q/combo_division", false, false);
	cb_division.attachEvent("onChange", function(){
		v.current_division = this.getSelectedValue() || "";
		$p.wsql.set_user_param("pl_division", v.current_division);
	});

	var cb_employee = frm_registration_prm.getCombo("cb_employee");
	cb_employee.load($p.wsql.get_user_param("pl_hs_url") + "/q/combo_employee", function(){
		if(v.current_employee){
			this.setComboValue(v.current_employee);
		}
	});
	cb_employee.enableFilteringMode("between", $p.wsql.get_user_param("pl_hs_url") + "/q/combo_employee", false, false);
	cb_employee.attachEvent("onChange", function(){
		v.current_employee = this.getSelectedValue() || "";
		$p.wsql.set_user_param("pl_employee", v.current_employee);
	});
}
