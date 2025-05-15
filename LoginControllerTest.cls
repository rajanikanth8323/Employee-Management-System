@isTest
private class LoginControllerTest {

    // Helper method to create an Employee__c record
    private static Employee__c createEmployee(String name) {
        return new Employee__c(
            Name = name,
            Department__c = 'IT',
            Designation__c = 'Developer',
        Joining_Date__c = Date.today().format()


 // Changed to Date type as correct field type
        );
    }

    @isTest
    static void testGetEmployees() {
        insert new List<Employee__c>{
            createEmployee('Emp One'),
            createEmployee('Emp Two')
        };

        Test.startTest();
        List<Employee__c> employees = LoginController.getEmployees();
        Test.stopTest();

        System.assert(employees.size() >= 2, 'Should return inserted employees');
    }

   @isTest
static void testSaveEmployee_InsertAndUpdate() {
    Employee__c emp = createEmployee('New Employee');

    Test.startTest();
    // Insert employee
    Employee__c insertedEmp = LoginController.saveEmployee(emp);

    // Update inserted employee
    insertedEmp.Designation__c = 'Senior Developer';
    Employee__c updatedEmp = LoginController.saveEmployee(insertedEmp);
    Test.stopTest();

    System.assertNotEquals(null, insertedEmp.Id, 'Employee should be inserted');
    System.assertEquals('Senior Developer', updatedEmp.Designation__c, 'Employee should be updated');
}


    @isTest
    static void testDeleteEmployee() {
        Employee__c emp = createEmployee('Delete Employee');
        insert emp;

        Test.startTest();
        LoginController.deleteEmployee(emp.Id);
        Test.stopTest();

        Employee__c deletedEmp = [SELECT Id, IsDeleted FROM Employee__c WHERE Id = :emp.Id ALL ROWS];
        System.assert(deletedEmp.IsDeleted, 'Employee should be deleted');
    }

    @isTest
    static void testBulkDeleteEmployees() {
        List<Employee__c> employees = new List<Employee__c>{
            createEmployee('Bulk 1'),
            createEmployee('Bulk 2'),
            createEmployee('Bulk 3')
        };
        insert employees;

        List<Id> empIds = new List<Id>();
        for (Employee__c e : employees) {
            empIds.add(e.Id);
        }

        Test.startTest();
        LoginController.bulkDeleteEmployees(empIds);
        Test.stopTest();

        List<Employee__c> deletedEmps = [SELECT Id, IsDeleted FROM Employee__c WHERE Id IN :empIds ALL ROWS];
        for (Employee__c e : deletedEmps) {
            System.assert(e.IsDeleted, 'All employees should be deleted');
        }
    }
}
