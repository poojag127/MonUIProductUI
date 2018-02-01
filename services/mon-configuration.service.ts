import { Injectable } from '@angular/core';
import { ReplaySubject } from 'rxjs/ReplaySubject';
import { Subject } from 'rxjs/Subject';
import { Message } from 'primeng/primeng';
import * as URL from '../constants/mon-url-constants';
import { RestApiService } from './rest-api.service';
import { MonDataService } from './mon-data.service';
import { Http, Response, Headers, RequestOptions, URLSearchParams } from '@angular/http';
import * as _ from "lodash";
import { Store } from '@ngrx/store';

@Injectable()
export class MonConfigurationService {

    private topoName: string = "mosaic_stress_as1";

    private profileName: string = "test";
    private profileDesc: string;

    monTierTreeTableData: any[] = null;

    tierHeaderList: any[] = null;

    /***hold components array of components ***/
    compArgData: any[];


    /***Used to hold the configured data of monitor */
    saveMonitorData: {};  

    constructor(private http: Http, private _restApi: RestApiService,
                private monDataService: MonDataService,
                private store: Store<any>,

                
                ) {

    }

    handleError;
    getDataFromServerTierMonitors(): Promise<any> {
        let url = this.monDataService.getserviceURL() + URL.GET_TIER_MONITORS_DATA;

        let params: URLSearchParams = new URLSearchParams();
        params.set('topoName', this.topoName);
        params.set('jsonName', this.profileName);
        params.set('userName', this.monDataService.getUserName());
        params.set('testRun', this.monDataService.getTestRunNum().toString());

        return this.http.get(url, { search: params }).map(res => res.json())
            .toPromise()
            .then(res => {
                this.tierHeaderList = res["tierList"];
                console.log("Getting from server tierList--", this.tierHeaderList)
                this.monTierTreeTableData = res["treeTableData"]["data"];

            }).
            catch(this.handleError);
    }



    /**** This method sends request to server for getting  *****/
    getChildNodes(categoryName, id) {
        console.log("getChildNodes method called--", categoryName + categoryName + ", id = " + id);
        console.log("----------\n befor adding children---", this.monTierTreeTableData[id]);
        let url = this.monDataService.getserviceURL() + URL.GET_CHILD_NODES;


        let params: URLSearchParams = new URLSearchParams();
        params.set('topoName', this.topoName);
        params.set('jsonName', this.profileName);
        params.set('categoryName', categoryName);
        params.set('categoryId', id);
        params.set('userName', this.monDataService.getUserName());
        params.set('testRun', this.monDataService.getTestRunNum().toString());


        return this.http.get(url, { search: params }).map(res => res.json())
            .toPromise()
            .then(res => {
                let nodeData = _.find(this.monTierTreeTableData, function (each) { return each['data']['monitor'] == categoryName });
                nodeData['children'] = res;
                console.log("----------\n after adding children---", this.monTierTreeTableData[id]);
                console.log("--zzzzz--------\n");
                console.log("getChildNodes method called--", res)
            }).
            catch(this.handleError);
    }


    getComponentData(drivenJsonName, id): Promise<any> {

        console.log("id--", id)
        let url = this.monDataService.getserviceURL() + URL.GET_COMPONENTS + "?menuDrivenJsonName=" + drivenJsonName + "&userName=netstorm";
        console.log("url----", url)

        let params: URLSearchParams = new URLSearchParams();
        params.set('topoName', this.topoName);
        params.set('jsonName', this.profileName);
        params.set('userName', this.monDataService.getUserName());
        params.set('testRun', this.monDataService.getTestRunNum().toString());

        return this.http.get(url, { search: params }).map(res => res.json())
            .toPromise()
            .then(res => {

                this.addComponentsData(id, res)
                let obj = {};
                obj['data'] = res,
                obj['id'] = id;
                this.setCompArgsData(obj);
                this.store.dispatch({type:"ADD_COMPONENTS_DATA",payload: obj });
            }).
            catch(this.handleError);
    }

    /**
     * Add compArgsJson to selected node if treetable data
     * @param id  = id of selected row
     * @param data = compArgsJson data i.e components Data  of selected monitor
     */

    addComponentsData(id, data)
     {
        let arrId = id.split(".");

        /***getting parent  Node if selected node is any of the child node ****/
        let rowData = _.find(this.monTierTreeTableData, function (each) { return each['data']['id'] == arrId[0] });
        console.log("rowData--", rowData)

        if (arrId.length > 1) {
            let childNodes = rowData["children"];
            console.log("childNodes--", childNodes)
            rowData = _.find(childNodes, function (each) { return each['data']['id'] == id });
        }
        rowData["compArgsJson"] = data;
        console.log("monTierTreeTableData--", this.monTierTreeTableData)
    }

    // saveConfiguredData(saveMonitorData) {
    //     this.saveMonitorData = saveMonitorData;
    // }
    
    setCompArgsData(data) {
        console.log("data--", data)
        this.compArgData = data["data"];
    }


    getTierHeaderList(): any[] {
        return this.tierHeaderList;
    }

    getMonTierTableData(): any[] {
        return this.monTierTreeTableData;
    }

    getTopoName(): string {
        return this.topoName;
    }

    setTopoName(topoName: string) {
        this.topoName = topoName;
    }

    getProfileName(): string {
        return this.profileName;
        //return "cavisson";
    }

    setProfileName(profileName: string) {
        this.profileName = profileName;
    }

    getProfileDesc(): string {
        return this.profileDesc;
        //return "cavisson";
    }

    setProfileDesc(profileDesc: string) {
        this.profileDesc = profileDesc;
    }

    clearData() {

        this.topoName = null;

        this.profileName = null;
        this.profileDesc = "NA";

        this.monTierTreeTableData = null;

        this.tierHeaderList = null;
    }

    /**Method to call service to download(import) selected profile  */
    getMprof(topoName,profileName)
    {
       console.log("topo---", topoName,profileName)
        let url = `${URL.IMPORT_PROFILE}`+"?topoName="+`${topoName}`+"&profileName="+`${profileName}`+"&userName=netstorm";
        console.log("url for download--", url)
       return this._restApi.getDataByGetReq(url);
    }



    /**
     * 
     */
    saveConfiguredData(data)
    {
      console.log("saveConfiguredData--method called",data)
      console.log("this.saveMonitorData--",this.saveMonitorData)
      // this.modifyData(data);
      if(this.saveMonitorData != null  && this.saveMonitorData.hasOwnProperty(data.tier))
      {
        console.log("existing tier case")
        let isMonObjExist:boolean = false;
        let tierObjList = this.saveMonitorData[data.tier];
        console.log("tierObjList--",tierObjList)
        
        let monObjList = _.find(tierObjList,function(each) { return each.hasOwnProperty(data.monName)})

        for(let i = 0; i<tierObjList.length; i++) 
        {
          if(tierObjList[i].hasOwnProperty(data.monName))
          {
            console.log("existing monitor case")
            isMonObjExist = true;
            tierObjList[i][data.monName] = data.data
            break;
          }
        }

        if(!isMonObjExist)
           tierObjList.push({[data.monName]:data.data})   //new entry of monitor Object

      }
      else
      {
        console.log("new tier entry case")
        if( this.saveMonitorData == null)
           this.saveMonitorData = {};
           
        this.saveMonitorData[data.tier] = [];
        this.saveMonitorData[data.tier].push({[data.monName]:data.data})
      }
      console.log("this.saveMonitorData--",this.saveMonitorData)
   }


  /***Send Request to Server  ****/
  sendRequestToServer(data,topoName,jsonName)
  {
    console.log("sendRequestToServer method called--",data)
    let url = this.monDataService.getserviceURL() + URL.SAVE_DATA + "?topoName="+topoName+"&jsonName="+jsonName+"&userName=netstorm";
    let dataForServer = {"topoName":topoName,"profileName":jsonName,"tierMonConf":data}
    return this._restApi.getDataByPostReq(url,dataForServer)
  }

 /**
  * This functon is used to clear service "saveMonitorData" 
  * used for storing configured monitor data when new profile is created
  */
  clearSaveMonData()
  {
   this.saveMonitorData = {};
  }

}