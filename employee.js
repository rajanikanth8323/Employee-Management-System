import { LightningElement, track, wire } from 'lwc';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import getEmployees from '@salesforce/apex/LoginController.getEmployees';
import saveEmployee from '@salesforce/apex/LoginController.saveEmployee';
import deleteEmployee from '@salesforce/apex/LoginController.deleteEmployee';
import bulkDeleteEmployees from '@salesforce/apex/LoginController.bulkDeleteEmployees';
import { refreshApex } from '@salesforce/apex';

export default class EmployeePage extends LightningElement {
    @track employeeId;
    @track name;
    @track department;
    @track designation;
    @track joiningDate;
    @track selectedEmployeeIds = [];
    @track cardTitle = 'Add Employee';
    @track showListView = true;
    @track showFormView = false;

    departmentOptions = [
        { label: 'HR', value: 'HR' },
        { label: 'Finance', value: 'Finance' },
        { label: 'IT', value: 'IT' },
        { label: 'Sales', value: 'Sales' },
        { label: 'marketting', value:'marketting' }

    ];

    columns = [
        { label: 'Employee ID', fieldName: 'Id' },
        { label: 'Name', fieldName: 'Name' },
        { label: 'Department', fieldName: 'Department__c' },
        { label: 'Designation', fieldName: 'Designation__c' },
        {
            type: 'action',
            typeAttributes: {
                rowActions: [
                    { label: 'Edit', name: 'edit' },
                    { label: 'Delete', name: 'delete' }
                ]
            }
        }
    ];

    @wire(getEmployees)
    wiredEmployees;

    get employees() {
        return this.wiredEmployees?.data || [];
    }

    handleInputChange(event) {
        const field = event.target.name;
        this[field] = event.target.value;
    }

    handleAddEmployee() {
        this.resetForm();
        this.cardTitle = 'Add Employee';
        this.showListView = false;
        this.showFormView = true;
    }

    handleRowAction(event) {
        const actionName = event.detail.action.name;
        const row = event.detail.row;

        if (actionName === 'edit') {
            this.handleEdit(row);
        } else if (actionName === 'delete') {
            this.handleDelete(row);
        }
    }

    handleEdit(row) {
        this.cardTitle = 'Edit Employee';
        this.employeeId = row.Id;
        this.name = row.Name;
        this.department = row.Department__c;
        this.designation = row.Designation__c;
        this.joiningDate = row.Joining_Date__c;
        this.showListView = false;
        this.showFormView = true;
    }

    handleDelete(row) {
        deleteEmployee({ empId: row.Id })
            .then(() => {
                this.showToast('Success', 'Employee deleted successfully', 'success');
                return this.refreshData();
            })
            .catch(error => {
                this.showToast('Error', 'Error deleting employee', 'error');
            });
    }

  handleBulkDelete() {
    if (this.selectedEmployeeIds.length > 0) {
        bulkDeleteEmployees({ empIds: this.selectedEmployeeIds })
            .then(() => {
                this.showToast('Success', 'Selected employees deleted successfully', 'success');
                this.selectedEmployeeIds = [];
                return this.refreshData();
            })
            .catch(error => {
                this.showToast('Error', error.body.message || 'Error deleting selected employees', 'error');
            });
    } else {
        this.showToast('Warning', 'No employees selected', 'warning');
    }
}


    handleSave() {
        const employeeData = {
            Id: this.employeeId,
            Name: this.name,
            Department__c: this.department,
            Designation__c: this.designation,
            Joining_Date__c: this.joiningDate
        };

        saveEmployee({ employeeData })
            .then(() => {
                this.showToast('Success', this.employeeId ? 'Employee updated' : 'Employee added', 'success');
                this.handleCancel();
                return this.refreshData();
            })
            .catch(error => {
                this.showToast('Error', 'Error saving employee', 'error');
            });
    }


    handleCancel() {
        this.resetForm();
        this.showListView = true;
        this.showFormView = false;
    }


   handleRowSelection(event) {
    const selectedRows = event.detail.selectedRows;
    this.selectedEmployeeIds = selectedRows.map(row => row.Id);
    console.log('Selected IDs:', this.selectedEmployeeIds);
}



    refreshData() {
        return refreshApex(this.wiredEmployees);
    }

    showToast(title, message, variant) {
        this.dispatchEvent(new ShowToastEvent({
            title: title,
            message: message,
            variant: variant
        }));
    }

    resetForm() {
        this.employeeId = null;
        this.name = '';
        this.department = '';
        this.designation = '';
        this.joiningDate = '';
    }
}
