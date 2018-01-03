<html>
  <div style="border-bottom: 1px solid #ddd;">
  	<table>
  		<tr>
  			<td>
  				<div style="width: 30px; text-align: center; max-width:30px;">
	  			    <label class="switch">
	          		<input type="checkbox" id="switch_color_mode">
	          		<span class="slider round" id="switch_color_mode_title" title="Switch to dark mode."></span>
	          		</label>
          		</div>
  			</td>
    		<td>
    		
    			<h3 style="margin: 0; width:170px;  max-width: 170px; text-align: center;" class="text-value">Total Value</h3>
    		
    		</td>
    		<td>
    			<div style=" max-width: 80px;  width: 80px; text-align: right" id="total_value_div" class="text-value">
    				$<input id="total_value" type="number" min="0.0" step="any" style="width:70px; max-width: 70px; border: none; font-size: 13px;" class="text-value" value="0.00" disabled>
    			</div>
    			
    		</td>
    	</tr>
  	</table>
  </div>

  <table style="width: 300px;">
    <thead>
      <tr>
        <th style="width: 35px; max-width: 35px; text-align: left;" class="text-value" >
          Icon
        </th>
        <th style="width: 130px; max-width: 130px; text-align: center;" class="text-value">
          <div style="width: 130px; padding-left: 25px;">
           Balance
          </div>
         
        </th>
        <th style="width: 100px; max-width: 100px;" class="text-value">
          &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Value
         	<label class="switch">
          		<input type="checkbox" id="switch_value_type">
          		<span class="slider round" id="switch_value_type_title" title="Switch to market value. (Individual value of each coin)."></span>
          	</label>
        </th>
      </tr>
    </thead>

  </table>
  <div style="max-height: 410px; max-width: 300px; width: 300px; overflow-y: auto; border-top: 1px solid #ddd;" id="asset_list_body_div">
 	<table style="width: 100%;">
 		<tbody id="asset_list_body"  ></tbody>
 	</table>
  </div>
 
  <div style="width: 300px; text-align: center; border-top: 1px solid #ddd;" id="asset_input_table_show">
  	<table>
  		<tr>
  			<td>
  				<div style="width: 40px;"></div>
  			</td>
  			<td >
  				<div style="text-align: center; width: 220px;">
  					<input type="button" id="show_asset_input_table" title="Add a new asset." style=" height: 30px; width: 30px; border:0; margin-top:8px;  background: url(http://assetmonitor.us-east-2.elasticbeanstalk.com/Icon/add-button); background-size: 100% 100%; ">

  				</div>
  			</td>
  			<td style="text-align: right; width: 40px;">
  				 <input type="button" id="sign_out_button" title="Sign out" style="height: 25px; width: 25px; border:0; margin-top:8px; background: url(http://assetmonitor.us-east-2.elasticbeanstalk.com/Icon/logout-button); background-size: 100% 100%; ">
 
  			</td>
  		</tr>
  	</table>
  </div>
  
  <div style="border-top: 1px solid #ddd;" hidden="true" id="asset_input_table">
	  <table>
	    <tr>
	      <td colspan="3">
	      	<div style="text-align: center;">
		        <input type="text" name="q" placeholder="Asset..." id="asset_input" style="width: 48%;">
		        <input type="number" placeholder="Balance..." id="asset_balance_input" style="width: 48%;">
	        </div>
	      </td>
	    </tr>
	    <tr>
	      <td colspan="3">
	        <div style="text-align: center;">
	          <input type="button" value="Submit"  id="submit_add_asset_button" style="width: 49%;">
	          <input type="button" value="Cancel"  id="cancel_add_asset_button" style="width: 49%;">
	        </div>
	      </td>
	    </tr>
	    <tr>
	      <td>
	        <div style="height: 65px;" id="extra_space_div"></div>
	      </td>
	    </tr>
	  </table>
  </div>
  <div id='assets-from-server' hidden="false">
  	${data}
  </div>
    <div id='settings-from-server' hidden="false">
  	${settings}
  </div>
</html>