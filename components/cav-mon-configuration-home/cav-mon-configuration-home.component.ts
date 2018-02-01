import { Component, OnInit } from '@angular/core';
import { TreeNode } from 'primeng/primeng';
import { MonConfigurationService } from '../../services/mon-configuration.service';
import { ActivatedRoute, Params, Router } from '@angular/router';

import * as URL from '../../constants/mon-url-constants';
import { Store } from '@ngrx/store';


@Component({
  selector: 'app-cav-mon-configuration-home',
  templateUrl: './cav-mon-configuration-home.component.html',
  styleUrls: ['./cav-mon-configuration-home.component.css']
})

export class CavMonConfigurationHomeComponent implements OnInit {

  profileName: String;
 
  topoName: String;
 
  cols: any[] = [];
 
  compData: TreeNode[];

  checkBoxStateArr:any[]=[]; //used for storing state of checkboxes at tier level

  tempObj:{}={};  //used for contructing data to send to the server

  constructor(private monConfServiceObj: MonConfigurationService,
              private router:Router,
              private route: ActivatedRoute,
              private store: Store<any>
   ) { }

  ngOnInit() 
  {

    this.profileName = this.monConfServiceObj.getProfileName();
    this.topoName = this.monConfServiceObj.getTopoName();

    if (this.monConfServiceObj.getTierHeaderList() == null) {
      this.monConfServiceObj.getDataFromServerTierMonitors().then(data => {
        this.createHeadersList(this.monConfServiceObj.getTierHeaderList());
        this.compData = this.monConfServiceObj.getMonTierTableData();
      });
    }
    else {
      this.createHeadersList(this.monConfServiceObj.getTierHeaderList());
      this.compData = this.monConfServiceObj.getMonTierTableData();
    }
    
  }

  /***Function used to create header list array for treetable component *****/
  createHeadersList(tierList) {
    if (tierList != null) {
      console.log("tierList--", tierList)
      let that = this;
      tierList.forEach((function (val) {
        that.cols.push({ field: val.id, header: val.name })
      }));
    }
  }

  loadNode(event) {
    console.log("event---", event)
    if (event.node) {
      //in a real application, make a call to a remote url to load children of the current node and add the new nodes as children
      if (event.node.children.length == 0)
        this.monConfServiceObj.getChildNodes(event.node.data.monitor,event.node.data.id);
    }
  }
 
 /**
  * 
  * @param value 
  * @param tierName 
  * @param monitorName 
  */

  onCheckBoxChange(value,tierName,monitorName)
 {
   console.log("onCheckBoxChange method called--",value)
   console.log("tierName--",tierName)
   console.log("monName-- ", monitorName)
 
   let key = monitorName + tierName;
   console.log("key---" ,key)

   let isEntryExist:boolean = false;
   let temp = this.checkBoxStateArr;
   for(let i = 0;i < temp.length; i++)
   {
     if(Object.keys(temp[i])[0] == tierName)
     {
       isEntryExist = true;
       temp[i] = value;
       break;
     }
   }

   if(!isEntryExist)
   {
     let obj = {[key]:value}
     this.checkBoxStateArr.push(obj)
   }
   console.log("this.checkBoxStateArr--",this.checkBoxStateArr)
 }

    /*** for advance settings ***/
  advanceSettings(monData,tierId,tierName)
  {
    console.log("monData--",monData)
    let currNode = monData["data"];
    console.log("currNode-",currNode)
    let monName = currNode["monitor"];
    console.log("monData--",monData)
    console.log("monName",monName)
    if(monName.startsWith('Weblogic'))
    {
      //this.router.navigate(['../../../weblogicSettings',this.profileName,this.topoName,monName,tierId,tierName],{ relativeTo: this.route });
    }
    else
    {
      console.log("monData--",monName)
      let compData = '';
      let obj ={};
      if(!currNode.hasOwnProperty("compArgJson") )
      {
       this.monConfServiceObj.getComponentData(currNode['drivenJsonName'],currNode['id']).then(data => {
         this.router.navigate([URL.MON_CONFIGURATION,this.profileName,this.topoName,monName,tierId,tierName],{ relativeTo: this.route });
       })   
      }
      else 
      {
       compData = currNode['compArgJson'];
       obj['data']=compData,
       obj['id']= currNode["id"] 
       this.monConfServiceObj.setCompArgsData(obj);
       this.store.dispatch({type:"ADD_COMPONENTS_DATA",payload: obj });
       this.router.navigate([URL.MON_CONFIGURATION,this.profileName,this.topoName,monName,tierId,tierName],{ relativeTo: this.route });
      }
    }
  }
 


/**
 * This method used to construct the data send that is used to send to the server
 * Here 
 * configuredData =  {
      "TierName": [
                    {
                      "MQMonitor":[
                             {
                             "serverName": "10.10.50.5",
                              "instanceName": "abc",
                              "enabled": "true",
                              "app": [
                                  {
                                   "appName": "default",
                                   "options": "-m…."
                                 }
                               ]
                            },
                            {

                            }]
  
  * ServerRequiredData as:
                {
   "T1": {"IBMMQStats":
                      {
                      "isEnabled":true,
			                "serverDTOList":[{serverName :"",
			                                  excludeServer :"",
								                        instanceName :"",
								                       isEnable :"true",
								                      appDTOList:[{ appName = "default",options = "",javaHome = "",classPath = ""}]
								                },
								             {
				                     serverName :"",
			                       excludeServer :"",
								             instanceName :"",
								             isEnable :"true",
								            appDTOList:[{ appName = "default",options = "",javaHome = "",classPath = ""}]
								          }								 
								       ]
				      			},						
			 "IBMMQStats2":
			         {
                "isEnabled":true,
			          "serverDTOList":[{
				          serverName :"",
			             excludeServer :"",
								   instanceName :"",
								   isEnable :"true",
								   appDTOList:[{ appName = "default",options = "",javaHome = "",classPath = ""}]
								 },
								 {
				                   serverName :"",
			                       excludeServer :"",
								   instanceName :"",
								   isEnable :"true",
								   appDTOList:[{ appName = "default",options = "",javaHome = "",classPath = ""}]
						          }							 
								]}
		}
							  

}
*/
  saveMonitorsConfigurationData()
  {
   console.log("treeTableData---",this.compData)
   console.log(" this.checkBoxStateArr---", this.checkBoxStateArr)
   console.log("this.monConfServiceObj.saveMonitorData-",this.monConfServiceObj.saveMonitorData)

   let configuredData =  JSON.parse(JSON.stringify(this.monConfServiceObj.saveMonitorData));

   console.log("configuredData--",configuredData)
   let that = this;
   let newTierData = {};

   
   for (var key in configuredData)
   {
     console.log("configuredData--",configuredData)
     console.log("configuredData[key]--",configuredData[key])
     let monList = configuredData[key];
     console.log("monList--",monList)
     monList.map(function(each)
     {
     console.log("each--iterating monlist---",each)
     let monName = Object.keys(each)[0];
     
     let serverConfList = each[monName];

     console.log("serverConfList--",serverConfList.length)
    

     let tempObj = {};

     serverConfList.map(function(eachServerConf)
     {
       console.log("eachServerConf----",eachServerConf)
     
     /****Here key = serverName ,enabled ***/
       let key = eachServerConf["serverName"]+ ","+ true;
     
       if(!tempObj.hasOwnProperty(key))
           tempObj[key] = [];

        tempObj[key].push(eachServerConf);
       })

      let serverMonList = that.createEachConfObject(tempObj); 
      each[monName] = {"isEnabled":true,"serverDTOList":serverMonList};  //here value for isEnabled is enabling/disabling for tier
      console.log("each- after modifying---",each)
      newTierData[key] = each ;
     })
     console.log("newTierData--",newTierData)
   }
   console.log("configuredData------------",newTierData)
   this.sendRequestToServer(newTierData);
  }

 /**
  * 
  */
  createEachConfObject(tempObj)
  {
    let serverMonList = [];
    console.log(" this.tempObj--", tempObj)
    for(var key in tempObj)
    {
     let obj = {};
     let arrValues = key.split(",");
     obj["serverName"] = arrValues[0];
     obj["isEnabled"] = arrValues[1];
     obj["appDTOList"] = [];
     
     let valueData = tempObj[key];
     valueData.map(function(each){
       console.log("each-Conf Data-----",each)
       let appObj = {"appName":each["appName"],"options":each["options"]}
       obj["appDTOList"].push(appObj);
     })
     serverMonList.push(obj);
    }
    return serverMonList;
  }



  /***
   * 
   */
  sendRequestToServer(configuredData)
  {
   console.log("sendRequestToServer method called")
   this.monConfServiceObj.sendRequestToServer(configuredData,this.topoName,this.profileName).subscribe(data =>{
   })
  }
  


  
}
