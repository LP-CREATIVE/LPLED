// Define our main App component
const App = () => {
  const [salaryData, setSalaryData] = useState([]);
  const [departmentData, setDepartmentData] = useState([]);
  const [selectedDepartment, setSelectedDepartment] = useState(null);
  const [loading, setLoading] = useState(true);

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];
  
  // This is our sample data - in a real app, you'd fetch this from an API or file
  const sampleData = [
    {department: "EXECUTIVE", role: "CEO", monthlySalary: 15000, yearlySalary: 180000, jobDescription: "Leads company vision, investor relations, and overall strategy."},
    {department: "EXECUTIVE", role: "COO", monthlySalary: 12500, yearlySalary: 150000, jobDescription: "Oversees daily operations, logistics, and execution of national install strategy."},
    {department: "EXECUTIVE", role: "CFO", monthlySalary: 12500, yearlySalary: 150000, jobDescription: "Manages company finances, forecasting, budgeting, and reporting."},
    {department: "FULFILLMENT", role: "Regional Ops Manager", monthlySalary: 6000, yearlySalary: 72000, jobDescription: "Manages 20–30 install teams, handles logistics, scheduling, and field ops."},
    {department: "FULFILLMENT", role: "Logistics Coordinator", monthlySalary: 5500, yearlySalary: 66000, jobDescription: "Optimizes install routes, daily dispatch, and coordinates job flow."},
    {department: "FULFILLMENT", role: "Fleet Manager", monthlySalary: 4500, yearlySalary: 54000, jobDescription: "Oversees truck leases, fuel systems, maintenance schedules, DOT compliance."},
    {department: "FULFILLMENT", role: "Install Tech", monthlySalary: 4000, yearlySalary: 48000, jobDescription: "On-site installs, drives leased truck, manages install quality."},
    {department: "FULFILLMENT", role: "Install Assistant", monthlySalary: 3000, yearlySalary: 36000, jobDescription: "Supports lead installer with job site prep, lifting, and coordination."},
    {department: "SUPPORT", role: "Client Success Rep", monthlySalary: 4500, yearlySalary: 54000, jobDescription: "Manages KW agent onboarding, support, and ongoing relationship."},
    {department: "SUPPORT", role: "Tech Support Rep", monthlySalary: 4500, yearlySalary: 54000, jobDescription: "Handles sign-related issues, warranties, and technical customer service."},
    {department: "ADMIN & ORG", role: "Bookkeeper", monthlySalary: 4000, yearlySalary: 48000, jobDescription: "Daily bookkeeping, invoicing, reconciliations, and reporting."},
    {department: "ADMIN & ORG", role: "HR Manager", monthlySalary: 5000, yearlySalary: 60000, jobDescription: "Oversees recruiting, onboarding, compliance, payroll, and employee support."},
    {department: "ADMIN & ORG", role: "Operations Analyst", monthlySalary: 5000, yearlySalary: 60000, jobDescription: "Tracks install metrics, team productivity, cost data, and strategic KPIs."},
    {department: "ADMIN & ORG", role: "Admin Assistant", monthlySalary: 3000, yearlySalary: 36000, jobDescription: "Manages records, scheduling, communications."},
    {department: "ADMIN & ORG", role: "Marketing Manager", monthlySalary: 4000, yearlySalary: 48000, jobDescription: "Runs social media, ads, influencer deals, content strategy."},
    {department: "R&D", role: "Product Manager (App)", monthlySalary: 6000, yearlySalary: 72000, jobDescription: "Leads roadmap, features, and app experience development."},
    {department: "R&D", role: "Software Engineer", monthlySalary: 6750, yearlySalary: 81000, jobDescription: "Builds and maintains app/backend platform, integrations, and internal tools."},
    {department: "WAREHOUSING", role: "Warehouse Manager", monthlySalary: 4500, yearlySalary: 54000, jobDescription: "Oversees daily ops, inventory, logistics."},
    {department: "WAREHOUSING", role: "Operations Associate", monthlySalary: 3000, yearlySalary: 36000, jobDescription: "Handles product movement, receiving, physical tasks."},
    {department: "WAREHOUSING", role: "Operations Associate", monthlySalary: 3000, yearlySalary: 36000, jobDescription: "Handles product movement, receiving, physical tasks."},
    {department: "WAREHOUSING", role: "Operations Associate", monthlySalary: 3000, yearlySalary: 36000, jobDescription: "Handles product movement, receiving, physical tasks."}
  ];

  useEffect(() => {
    // In a real app, we would fetch data from an API or file
    // For this example, we'll use the sample data directly
    processData(sampleData);
    setLoading(false);
  }, []);

  const processData = (data) => {
    // Group data by department
    const departmentMap = {};
    
    data.forEach(item => {
      if (!departmentMap[item.department]) {
        departmentMap[item.department] = [];
      }
      departmentMap[item.department].push({
        role: item.role,
        monthlySalary: item.monthlySalary,
        yearlySalary: item.yearlySalary,
        jobDescription: item.jobDescription
      });
    });
    
    // Calculate department statistics
    const deptStats = Object.entries(departmentMap).map(([deptName, roles], index) => {
      const validSalaries = roles.filter(r => r.yearlySalary).map(r => r.yearlySalary);
      
      return {
        name: deptName,
        roles: roles,
        count: roles.length,
        avgSalary: validSalaries.length > 0 ? 
          validSalaries.reduce((sum, sal) => sum + sal, 0) / validSalaries.length : 0,
        minSalary: validSalaries.length > 0 ? Math.min(...validSalaries) : 0,
        maxSalary: validSalaries.length > 0 ? Math.max(...validSalaries) : 0,
        color: COLORS[index % COLORS.length]
      };
    });

    // Sort roles by salary for role-based charts
    const allRoles = data.sort((a, b) => b.yearlySalary - a.yearlySalary);

    setSalaryData(allRoles);
    setDepartmentData(deptStats);
    if (deptStats.length > 0) {
      setSelectedDepartment(deptStats[0]);
    }
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0
    }).format(value);
  };

  if (loading) {
    return <div className="loading">Loading dashboard data...</div>;
  }

  // Calculate company-wide stats
  const totalRoles = departmentData.reduce((sum, dept) => sum + dept.count, 0);
  const avgCompanySalary = salaryData.length > 0 
    ? salaryData.reduce((sum, role) => sum + role.yearlySalary, 0) / salaryData.length 
    : 0;
  const maxSalary = salaryData.length > 0 
    ? Math.max(...salaryData.map(role => role.yearlySalary)) 
    : 0;

  // Prepare data for pie chart
  const departmentPieData = departmentData.map(dept => ({
    name: dept.name,
    value: dept.count,
    color: dept.color
  }));

  // Selected department roles
  const departmentRolesData = selectedDepartment 
    ? selectedDepartment.roles.filter(role => role.yearlySalary).sort((a, b) => b.yearlySalary - a.yearlySalary)
    : [];

  return (
    <div className="dashboard">
      <div className="header">
        <h1 className="title">Real Estate Digital Signs</h1>
        <h2 className="subtitle">Salary & Workforce Dashboard</h2>
      </div>

      {/* Stats cards */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="icon-container">
            <Recharts.Users size={24} color="#0088FE" />
          </div>
          <div>
            <p>Total Positions</p>
            <p className="title">{totalRoles}</p>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="icon-container">
            <Recharts.DollarSign size={24} color="#00C49F" />
          </div>
          <div>
            <p>Average Salary</p>
            <p className="title">{formatCurrency(avgCompanySalary)}</p>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="icon-container">
            <Recharts.TrendingUp size={24} color="#FFBB28" />
          </div>
          <div>
            <p>Highest Salary</p>
            <p className="title">{formatCurrency(maxSalary)}</p>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="icon-container">
            <Recharts.Building size={24} color="#FF8042" />
          </div>
          <div>
            <p>Departments</p>
            <p className="title">{departmentData.length}</p>
          </div>
        </div>
      </div>

      {/* Department selector */}
      <div className="dept-selector">
        <h3>Select Department:</h3>
        <div>
          {departmentData.map((dept) => (
            <button
              key={dept.name}
              className={selectedDepartment && selectedDepartment.name === dept.name ? "active" : ""}
              onClick={() => setSelectedDepartment(dept)}
            >
              {dept.name}
            </button>
          ))}
        </div>
      </div>

      {/* Charts grid */}
      <div className="grid-2-col">
        {/* Department breakdown */}
        <div className="chart-container">
          <h3 className="chart-title">Workforce by Department</h3>
          <div style={{ height: 300 }}>
            <Recharts.ResponsiveContainer width="100%" height="100%">
              <Recharts.PieChart>
                <Recharts.Pie
                  data={departmentPieData}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {departmentPieData.map((entry, index) => (
                    <Recharts.Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Recharts.Pie>
                <Recharts.Tooltip formatter={(value) => [`${value} positions`, 'Count']} />
              </Recharts.PieChart>
            </Recharts.ResponsiveContainer>
          </div>
        </div>

        {/* Department salaries */}
        <div className="chart-container">
          <h3 className="chart-title">
            {selectedDepartment ? `${selectedDepartment.name} Salaries` : 'Department Salaries'}
          </h3>
          {selectedDepartment && (
            <div className="chart-subtitle">
              Average: {formatCurrency(selectedDepartment.avgSalary)} | 
              Range: {formatCurrency(selectedDepartment.minSalary)} - {formatCurrency(selectedDepartment.maxSalary)}
            </div>
          )}
          <div style={{ height: 300 }}>
            <Recharts.ResponsiveContainer width="100%" height="100%">
              <Recharts.BarChart
                data={departmentRolesData}
                layout="vertical"
                margin={{ top: 5, right: 30, left: 100, bottom: 5 }}
              >
                <Recharts.CartesianGrid strokeDasharray="3 3" />
                <Recharts.XAxis type="number" tickFormatter={(value) => `$${value/1000}k`} />
                <Recharts.YAxis dataKey="role" type="category" width={90} />
                <Recharts.Tooltip 
                  formatter={(value) => [formatCurrency(value), 'Annual Salary']}
                  labelFormatter={(label) => `Role: ${label}`}
                />
                <Recharts.Bar dataKey="yearlySalary" fill="#8884d8" name="Annual Salary" />
              </Recharts.BarChart>
            </Recharts.ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Company-wide salaries */}
      <div className="chart-container">
        <h3 className="chart-title">Company-wide Salary Comparison</h3>
        <div style={{ height: 400 }}>
          <Recharts.ResponsiveContainer width="100%" height="100%">
            <Recharts.BarChart
              data={salaryData}
              margin={{ top: 5, right: 30, left: 20, bottom: 100 }}
            >
              <Recharts.CartesianGrid strokeDasharray="3 3" />
              <Recharts.XAxis 
                dataKey="role" 
                interval={0} 
                angle={-45} 
                textAnchor="end" 
                height={100} 
              />
              <Recharts.YAxis tickFormatter={(value) => `$${value/1000}k`} />
              <Recharts.Tooltip 
                formatter={(value) => [formatCurrency(value), 'Annual Salary']}
                labelFormatter={(label) => `Role: ${label}`}
              />
              <Recharts.Bar dataKey="yearlySalary" name="Annual Salary" fill="#82ca9d" />
            </Recharts.BarChart>
          </Recharts.ResponsiveContainer>
        </div>
      </div>

      {/* Department summary table */}
      <div className="table-container">
        <h3 className="chart-title">Department Summary</h3>
        <table>
          <thead>
            <tr>
              <th>Department</th>
              <th>Positions</th>
              <th>Avg. Salary</th>
              <th>Min Salary</th>
              <th>Max Salary</th>
            </tr>
          </thead>
          <tbody>
           {departmentData.map((dept) => (
              <tr key={dept.name}>
                <td>{dept.name}</td>
                <td>{dept.count}</td>
                <td>{formatCurrency(dept.avgSalary)}</td>
                <td>{formatCurrency(dept.minSalary)}</td>
                <td>{formatCurrency(dept.maxSalary)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// Required React hooks - must be defined before using them
const { useState, useEffect } = React;
