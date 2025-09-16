Generate a React + Tailwind dashboard page for an Attendance Management System.

Requirements:

1. Layout
- Top row: 4 KPI cards showing:
  - Total Employees
  - Present Today
  - Late Arrivals
  - On Leave
- Each KPI card has a title (small text) and a large number.

2. Main content area
- Left side (2/3 width): "Attendance Statistics" card with placeholder for charts.
  - Add two chart placeholders:
    - Pie chart: Status distribution (Present, Late, Absent, Leave, Not Checked-out)
    - Bar chart: Check-ins by hour
- Right side (1/3 width): stacked cards
  - Card 1: "Attendance Alerts"
    - Show list of alerts (employee checked in, late arrivals, forgot check-out, leave requests)
  - Card 2: "HR Quick Actions"
    - Buttons: Add new employee, Approve corrections, Export report, Assign shift

3. Styling
- Use Tailwind CSS classes for modern, clean admin UI.
- Cards should have rounded corners, white background, soft shadow.
- KPI numbers should be bold and large.
- Alerts list with subtle border-bottom.
- Quick action buttons full width, light background, hover effect.

4. Responsiveness
- On desktop: 4 KPI cards in a row, then a grid with charts on left and alerts/actions on right.
- On mobile: stack all cards vertically.

Deliverable:
- A single React functional component using Tailwind CSS.
- Use placeholders `<div>` for charts (to integrate Chart.js or Recharts later).
- Sample static data for KPIs and alerts.
