import { Injectable } from '@angular/core';
import { ReplaySubject } from 'rxjs/ReplaySubject';
import { Subject } from 'rxjs/Subject';
import { Message } from 'primeng/primeng';
import { CavConfigService } from '../../../main/services/cav-config.service';
import { CavTopPanelNavigationService } from '../../../main/services/cav-top-panel-navigation.service';



@Injectable()
export class MonDataService {
    productType: string = 'NS';

    userName: string = 'cavisson';
    groupType: string = 'cavisson';
    userRole: string = 'guest';

    //testRun number
    testRunNum: number = -1;
    monMode: number = 0; //0 - Edit, 1- View Mode, 2 test run offline mode and 3 - run time changes

    isFromWebDashboard: boolean = false;

    selectedTopoName: String = "";

    private serviceURL: string = "http://10.10.40.7:8006/ProductUI/productSummary/MonitorWebService/";


   constructor(private _productConfig: CavConfigService, private _navService: CavTopPanelNavigationService) {
        //need to change
        this.serviceURL = this._productConfig.getINSPrefix() + this._navService.getDCNameForScreen('monitorgui') + "/ProductUI/productSummary/MonitorWebService/";
    }

     public initConfiguration()
     {
       try
        {
          /*Checking for availability of session. */
          if (this._productConfig.$userName == null) {
            // this.log.info('Session not available. Restoring session.');
            this._productConfig.restoreConfiguration();
           }

          this.userName = this._productConfig.$userName;
          
          if(this._productConfig.$featurePermissionList) {
              //need to changes
            let featurePermList = this._productConfig.$featurePermissionList["Start/Stop Test"];
      
            if(featurePermList == 7) {
                this.userRole = 'admin';
            }
            else if(featurePermList > 4 && featurePermList < 7) {
              this.userRole = 'normal';
            }
            else {
              this.userRole = 'guest';
            }
          }
        }
        catch(e) {
            console.error('initConfiguration | exception e = ', e);
        }
    }

    setTestRunNum(testRunNum: number) {
        this.testRunNum = testRunNum;
    }
    getTestRunNum(): number {
        return this.testRunNum;
    }

    getMonMode(): number {
        return this.monMode;
    }

    setMonMode(mode: number) {
        this.monMode = mode;
    }

    getProductType() {
        return this.productType;
    }

    setProductType(type: string) {
        this.productType = type;
    }

    getUserName(): string {
        return this.userName;
        //return "cavisson";
    }

    setUserName(username: string) {
        this.userName = username;
    }

    public get $userRole(): string {
        return this.userRole;
    }

    public set $userRole(value: string) {
        this.userRole = value;
    }

    getserviceURL(): string {
        return this.serviceURL;
    }

    setServiceURL(url: string) {
        this.serviceURL = url;
    }


    setSelectedtopology(selectedTopoName: string) {
        this.selectedTopoName = selectedTopoName;
    }

    public getWebDashboardFlag() {
        return this.isFromWebDashboard;
    }

    public setWebDashboardFlag(flag: boolean) {
        this.isFromWebDashboard = flag;
    }

}
