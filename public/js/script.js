document.getElementById('viewUsersBtn').addEventListener('click', async () => {
    try {
        let response = await fetch('http://localhost:3000/api/pharmacists');
        let data = await response.json();
        let content = document.getElementById('content_1');
        content.innerHTML = ''; // Clear existing content

        // Append data to the content div as a table
        content.innerHTML += `<table>
            <tr>
                <th>ID</th>
                <th>First Name</th>
                <th>Last Name</th>
                <th>Staff ID</th>
                <th>Address</th>
                <th>Phone</th>
                <th>Email</th>
                <th>Username</th>
                <th>Date</th>
            </tr>`;
        data.forEach(pharmacist => {
            content.innerHTML += `<tr>
                <td>${pharmacist.pharmacist_id}</td>
                <td>${pharmacist.first_name}</td>
                <td>${pharmacist.last_name}</td>
                <td>${pharmacist.staff_id}</td>
                <td>${pharmacist.postal_address}</td>
                <td>${pharmacist.phone}</td>
                <td>${pharmacist.email}</td>
                <td>${pharmacist.username}</td>
                <td>${pharmacist.date}</td>
            </tr>`;
        });
        content.innerHTML += '</table>';
    } catch (error) {
        console.error('Error fetching pharmacists:', error);
    }
});
