// script.js
let currentPage = 'list';
let itemsPerPage = 5;
let currentPageNumber = 1;
let currentItems = [];

function navigateTo(page) {
    document.querySelectorAll('.page').forEach(p => p.style.display = 'none');
    document.getElementById(`page-${page}`).style.display = 'block';
    currentPage = page;
    if (page === 'stats') app.renderStats();
}

function showForm(student = null) {
    document.getElementById('formModal').style.display = 'flex';
    const form = document.getElementById('studentForm');
    form.reset();
    if (student) {
        document.getElementById('studentIdHidden').value = student.id;
        document.getElementById('studentId').value = student.studentId;
        document.getElementById('fullName').value = student.fullName;
        document.getElementById('email').value = student.email;
        document.getElementById('phone').value = student.phone;
        document.getElementById('major').value = student.major;
        document.getElementById('year').value = student.year;
    }
}

function closeForm() {
    document.getElementById('formModal').style.display = 'none';
}

class StudentManager {
    constructor() {
        this.students = JSON.parse(localStorage.getItem('students')) || [];
        this.filtered = [...this.students];
        this.init();
    }

    init() {
        document.getElementById('studentForm').addEventListener('submit', e => this.handleSubmit(e));
        this.applyFilters();
    }

    handleSubmit(e) {
        e.preventDefault();
        const id = document.getElementById('studentIdHidden').value || Date.now().toString();
        const student = {
            id,
            studentId: document.getElementById('studentId').value.trim(),
            fullName: document.getElementById('fullName').value.trim(),
            email: document.getElementById('email').value.trim(),
            phone: document.getElementById('phone').value.trim(),
            major: document.getElementById('major').value,
            year: document.getElementById('year').value,
            createdAt: new Date().toLocaleDateString('ja-JP')
        };

        const index = this.students.findIndex(s => s.id === id);
        if (index > -1) this.students[index] = student;
        else this.students.push(student);

        this.save();
        closeForm();
        this.applyFilters();
    }

    editStudent(id) {
        const student = this.students.find(s => s.id === id);
        if (student) showForm(student);
    }

    deleteStudent(id) {
        if (confirm('この学生を削除してもよろしいですか？')) {
            this.students = this.students.filter(s => s.id !== id);
            this.save();
            this.applyFilters();
        }
    }

    save() {
        localStorage.setItem('students', JSON.stringify(this.students));
    }

    applyFilters() {
        const search = document.getElementById('searchBox').value.toLowerCase();
        const filterMajor = document.getElementById('filterMajor').value;
        this.filtered = this.students.filter(s => {
            const matchesSearch = s.fullName.toLowerCase().includes(search) ||
                                  s.studentId.toLowerCase().includes(search) ||
                                  s.email.toLowerCase().includes(search);
            const matchesMajor = filterMajor ? s.major === filterMajor : true;
            return matchesSearch && matchesMajor;
        });
        currentPageNumber = 1;
        this.renderTable();
        this.renderPaginationControls();
    }

    renderTable() {
        const container = document.getElementById('tableContainer');
        const start = (currentPageNumber - 1) * itemsPerPage;
        const end = start + itemsPerPage;
        const totalPages = Math.ceil(this.filtered.length / itemsPerPage);
        currentItems = this.filtered.slice(start, end);

        let html = '<table><thead><tr>' +
            '<th>学籍番号</th><th>氏名</th><th>メール</th><th>電話番号</th><th>専攻</th><th>学年</th><th>日付</th><th>操作</th></tr></thead><tbody>';

        if (currentItems.length === 0) {
            html += '<tr><td colspan="8" style="text-align:center">データがありません</td></tr>';
        } else {
            currentItems.forEach(s => {
                html += `<tr>
                    <td>${s.studentId}</td>
                    <td>${s.fullName}</td>
                    <td>${s.email}</td>
                    <td>${s.phone}</td>
                    <td>${s.major}</td>
                    <td>${s.year}</td>
                    <td>${s.createdAt}</td>
                    <td>
                        <button class="btn" onclick="app.editStudent('${s.id}')">編集</button>
                        <button class="btn" onclick="app.deleteStudent('${s.id}')">削除</button>
                    </td>
                </tr>`;
            });
        }
        html += '</tbody></table>';
        container.innerHTML = html;
    }

    renderPaginationControls() {
        const container = document.getElementById('tableContainer');
        const totalPages = Math.ceil(this.filtered.length / itemsPerPage);

        if (totalPages <= 1) return;

        let controls = '<div class="pagination" style="text-align:center; margin-top:10px">';

        if (currentPageNumber > 1) {
            controls += `<button onclick="changePage(${currentPageNumber - 1})">前へ</button>`;
        }

        for (let i = 1; i <= totalPages; i++) {
            controls += `<button onclick="changePage(${i})"${i === currentPageNumber ? ' style="font-weight:bold"' : ''}>${i}</button>`;
        }

        if (currentPageNumber < totalPages) {
            controls += `<button onclick="changePage(${currentPageNumber + 1})">次へ</button>`;
        }

        controls += '</div>';
        container.innerHTML += controls;
    }

    renderStats() {
        const stats = {};
        this.students.forEach(s => {
            stats[s.major] = (stats[s.major] || 0) + 1;
        });

        const statsHtml = Object.entries(stats).map(([major, count]) =>
            `<div style="margin-bottom:10px">${major}: <strong>${count}</strong> 人</div>`
        ).join('');

        document.getElementById('statsContainer').innerHTML = statsHtml || '<p>データがありません</p>';
    }
}

function changePage(pageNumber) {
    currentPageNumber = pageNumber;
    app.renderTable();
    app.renderPaginationControls();
}

const app = new StudentManager();
navigateTo('list');
