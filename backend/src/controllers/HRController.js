const Employee = require('../models/Employee');
const User = require('../models/User');
const bcrypt = require('bcryptjs');

exports.addEmployee = async (req, res) => {
  try {
    const { 
      name, email, password, role = 'employee', 
      department, position, phone, salary, 
      joiningDate, project 
    } = req.body;

    // Check if employee already exists
    const existingEmployee = await Employee.findOne({ email });
    const existingUser = await User.findOne({ email });
    
    if (existingEmployee || existingUser) {
      return res.status(400).json({
        success: false,
        message: 'Employee with this email already exists'
      });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create employee
    const employee = new Employee({
      name,
      email,
      password: hashedPassword,
      role,
      department,
      position,
      phone,
      salary,
      joiningDate,
      project,
      status: 'active'
    });

    // Also create a user for login
    const user = new User({
      name,
      email,
      password: hashedPassword,
      role,
      isVerified: true
    });

    await employee.save();
    await user.save();

    // Return without password
    const employeeData = employee.toObject();
    delete employeeData.password;

    res.status(201).json({
      success: true,
      message: 'Employee added successfully',
      employee: employeeData
    });

  } catch (error) {
    console.error('Add employee error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to add employee'
    });
  }
};

exports.getAllEmployees = async (req, res) => {
  try {
    const employees = await Employee.find().select('-password');
    
    res.json({
      success: true,
      employees,
      count: employees.length
    });
  } catch (error) {
    console.error('Get employees error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch employees'
    });
  }
};

exports.getEmployeeById = async (req, res) => {
  try {
    const employee = await Employee.findById(req.params.id).select('-password');
    
    if (!employee) {
      return res.status(404).json({
        success: false,
        message: 'Employee not found'
      });
    }
    
    res.json({
      success: true,
      employee
    });
  } catch (error) {
    console.error('Get employee error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch employee'
    });
  }
};

exports.updateEmployee = async (req, res) => {
  try {
    const { 
      name, department, position, phone, 
      salary, project, status 
    } = req.body;

    const employee = await Employee.findById(req.params.id);
    
    if (!employee) {
      return res.status(404).json({
        success: false,
        message: 'Employee not found'
      });
    }

    // Update fields
    if (name) employee.name = name;
    if (department) employee.department = department;
    if (position) employee.position = position;
    if (phone) employee.phone = phone;
    if (salary) employee.salary = salary;
    if (project) employee.project = project;
    if (status) employee.status = status;

    await employee.save();

    // Also update user if needed
    const user = await User.findOne({ email: employee.email });
    if (user && name) {
      user.name = name;
      await user.save();
    }

    const employeeData = employee.toObject();
    delete employeeData.password;

    res.json({
      success: true,
      message: 'Employee updated successfully',
      employee: employeeData
    });

  } catch (error) {
    console.error('Update employee error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update employee'
    });
  }
};

exports.deleteEmployee = async (req, res) => {
  try {
    const employee = await Employee.findById(req.params.id);
    
    if (!employee) {
      return res.status(404).json({
        success: false,
        message: 'Employee not found'
      });
    }

    // Also delete user
    await User.findOneAndDelete({ email: employee.email });
    await employee.deleteOne();

    res.json({
      success: true,
      message: 'Employee deleted successfully'
    });
  } catch (error) {
    console.error('Delete employee error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete employee'
    });
  }
};