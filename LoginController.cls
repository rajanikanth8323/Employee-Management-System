public with sharing class LoginController {
    @AuraEnabled(cacheable=true)
    public static List<Employee__c> getEmployees() {
        return [
            SELECT Id, Name, Department__c, Designation__c, Joining_Date__c
            FROM Employee__c
            ORDER BY CreatedDate DESC
        ];
    }
    

    @AuraEnabled
    public static void deleteEmployee(Id empId) {
        delete [SELECT Id FROM Employee__c WHERE Id = :empId];
    }

    @AuraEnabled
    public static void bulkDeleteEmployees(List<Id> empIds) {
        try {
            delete [SELECT Id FROM Employee__c WHERE Id IN :empIds];
        } catch (Exception ex) {
            throw new AuraHandledException('Error deleting employees: ' + ex.getMessage());
        }
    }

    @AuraEnabled(cacheable=true)
    public static Employee__c getEmployeeDetails(Id empId) {
        return [
            SELECT Id, Name, Department__c, Designation__c, Joining_Date__c
            FROM Employee__c
            WHERE Id = :empId
            LIMIT 1
        ];
    }

    @AuraEnabled
    public static Employee__c saveEmployee(Employee__c employeeData) {
        if (employeeData.Id == null) {
            insert employeeData;
        } else {
            update employeeData;
        }
        return employeeData;
    }
}
