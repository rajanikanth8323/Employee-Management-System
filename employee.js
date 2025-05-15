import { LightningElement, track, wire } from 'lwc';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import getEmployees from '@salesforce/apex/LoginController.getEmployees';
import saveEmployee from '@salesforce/apex/LoginController.saveEmployee';
import deleteEmployee from '@salesforce/apex/LoginController.deleteEmployee';
import bulkDeleteEmployees from '@salesforce/apex/LoginController.bulkDeleteEmployees';
import { refreshApex } from '@salesforce/apex';

export default class EmployeePage extends LightningElement {
    @track employees = [];
    @track paginatedEmployees = [];
    @track currentPage = 1;
    @track pageSize = 5;
    @track selectedEmployeeIds = [];
    @track showListView = true;
    @track showFormView = false;
    @track employeeId;
    @track name;
    @track department;
    @track designation;
    @track joiningDate;
    @track cardTitle = 'Add Employee';



    departmentOptions = [
        { label: 'HR', value: 'HR' },
        { label: 'Finance', value: 'Finance' },
        { label: 'IT', value: 'IT' },
        { label: 'Sales', value: 'Sales' },
        { label: 'Marketing', value: 'Marketing' }
    ];

    pageSizeOptions = [
        { label: '2', value: '2' },
        { label: '4', value: '4' },
        { label: '5', value: '5' },
        { label: '8', value: '8' }
    ];

    // Added rowNumber column at the beginning
    columns = [
        { label: 'S.No', fieldName: 'rowNumber', type: 'number' },
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
    wiredEmployees({ error, data }) {
        if (data) {
            this.employees = data;
            this.updatePaginatedData();
        } else if (error) {
            this.showToast('Error', 'Failed to load employees', 'error');
        }
    }

    get isFirstPage() {
        return this.currentPage === 1;
    }

    get isLastPage() {
        return this.currentPage >= Math.ceil(this.employees.length / this.pageSize);
    }

    handleForward() {
        if (!this.isLastPage) {
            this.currentPage++;
            this.updatePaginatedData();
        }
    }

    handleBackward() {
        if (!this.isFirstPage) {
            this.currentPage--;
            this.updatePaginatedData();
        }
    }

    handlePageSizeChange(event) {
        this.pageSize = parseInt(event.detail.value, 10);
        this.currentPage = 1;
        this.updatePaginatedData();
    }

    updatePaginatedData() {
        const startIndex = (this.currentPage - 1) * this.pageSize;
        const endIndex = startIndex + this.pageSize;

        //  Add row numbers dynamically
        this.paginatedEmployees = this.employees.slice(startIndex, endIndex).map((emp, index) => {
            return {
                ...emp,
                rowNumber: startIndex + index + 1
            };
        });
    }

    handleAddEmployee() {
        this.resetForm();
        this.cardTitle = 'Add Employee';
        this.showListView = false;
        this.showFormView = true;
    }

    handleInputChange(event) {
        this[event.target.name] = event.target.value;
    }

    handleRowAction(event) {
        const action = event.detail.action.name;
        const row = event.detail.row;

        if (action === 'edit') {
            this.cardTitle = 'Edit Employee';
            this.employeeId = row.Id;
            this.name = row.Name;
            this.department = row.Department__c;
            this.designation = row.Designation__c;
            this.joiningDate = row.Joining_Date__c;
            this.showFormView = true;
            this.showListView = false;
        } else if (action === 'delete') {
            deleteEmployee({ empId: row.Id })
                .then(() => {
                    this.showToast('Success', 'Employee deleted', 'success');
                    this.refreshData();
                })
                .catch(() => {
                    this.showToast('Error', 'Delete failed', 'error');
                });
        }
    }

    handleRowSelection(event) {
        const selectedRows = event.detail.selectedRows;
        this.selectedEmployeeIds = selectedRows.map(row => row.Id);
    }

    handleBulkDelete() {
        if (this.selectedEmployeeIds.length > 0) {
            bulkDeleteEmployees({ empIds: this.selectedEmployeeIds })
                .then(() => {
                    this.showToast('Success', 'Employees deleted', 'success');
                    this.selectedEmployeeIds = [];
                    this.refreshData();
                })
                .catch(() => {
                    this.showToast('Error', 'Bulk delete ', 'error');
                });
        } else {
            this.showToast('Warning', 'No records selected', 'warning');
        }
    }

    handleSave() {
    if (!this.name) {
        this.showToast('Warning', 'Name is required', 'warning');
        return;
    }
    if (!this.department) {
        this.showToast('Warning', 'Department is required', 'warning');
        return;
    }
    if (!this.designation) {
        this.showToast('Warning', 'Designation is required', 'warning');
        return;
    }
    if (!this.joiningDate) {
        this.showToast('Warning', 'Joining Date is required', 'warning');
        return;
    }
        const employeeData = {
            Id: this.employeeId,
            Name: this.name,
            Department__c: this.department,
            Designation__c: this.designation,
            Joining_Date__c: this.joiningDate
        };

        saveEmployee({ employeeData })
            .then(() => {
                this.showToast('Success', this.employeeId ? 'Updated' : 'Added', 'success');
                this.handleCancel();
                this.refreshData();
            })
            .catch(() => {
                this.showToast('Error', 'Save failed', 'error');
            });
    }

    handleCancel() {
        this.resetForm();
        this.showFormView = false;
        this.showListView = true;
    }

    resetForm() {
        this.employeeId = null;
        this.name = '';
        this.department = '';
        this.designation = '';
        this.joiningDate = '';
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
}
