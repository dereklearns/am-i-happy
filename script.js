
document.addEventListener('DOMContentLoaded', () => {
  let selectedMood = null;
  const moodButtons = document.querySelectorAll('.emoji-picker button');
  const noteInput = document.getElementById('note');
  const logBtn = document.getElementById('log-btn');
  const chartCtx = document.getElementById('moodChart').getContext('2d');
  const tabs = document.querySelectorAll('.tab');
  const chartTab = document.getElementById('chart-tab');
  const journalTab = document.getElementById('journal-tab');
  const journalContainer = document.getElementById('journalEntries');
  
  document.getElementById('export-btn').addEventListener('click', () => {
    const logs = JSON.parse(localStorage.getItem('moodLogs') || '[]');
    if (logs.length === 0) return;
  
    const csv = ['timestamp,mood,note'];
    logs.forEach(log => {
      const line = `"${log.timestamp}",${log.mood},"${log.note.replace(/"/g, '""')}"`;
      csv.push(line);
    });
  
    const blob = new Blob([csv.join('\n')], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'mood_journal.csv';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  });
  document.getElementById('clear-btn').addEventListener('click', () => {
    const confirmClear = confirm('Are you sure you want to delete all journal entries? This cannot be undone.');
    if (confirmClear) {
      localStorage.removeItem('moodLogs');
      renderJournal();
      renderChart(); // optional: update chart too
    }
  });
  
  
  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      tabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
  
      if (tab.dataset.tab === 'chart') {
        chartTab.style.display = 'block';
        journalTab.style.display = 'none';
        renderChart();
      } else {
        chartTab.style.display = 'none';
        journalTab.style.display = 'block';
        renderJournal();
      }
    });
  });
  
  // Select mood
  moodButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      selectedMood = parseInt(btn.dataset.mood);
      moodButtons.forEach(b => b.classList.remove('selected'));
      btn.classList.add('selected');
    });
  });

  // Log mood
  logBtn.addEventListener('click', () => {
    if (!selectedMood) return alert("Please select a mood!");

    const entry = {
    //   date: new Date().toISOString().split('T')[0],
      timestamp: new Date().toISOString(),
      mood: selectedMood,
      note: noteInput.value.trim()
    };

    // Save to localStorage
    const logs = JSON.parse(localStorage.getItem('moodLogs') || '[]');
    logs.push(entry);
    localStorage.setItem('moodLogs', JSON.stringify(logs));

    noteInput.value = '';
    selectedMood = null;
    moodButtons.forEach(b => b.classList.remove('selected'));

    renderChart();
  });
// Render journal entries
function renderJournal() {
    const logs = JSON.parse(localStorage.getItem('moodLogs') || '[]');
    const tbody = document.querySelector('#journalEntries tbody');
    tbody.innerHTML = '';
  
    logs.forEach((log, index) => {
      const row = document.createElement('tr');
  
      const date = new Date(log.timestamp).toLocaleString();
      const moodIcon = ["", "😢", "😟", "😐", "🙂", "😄"][log.mood];
  
      row.innerHTML = `
        <td>${date}</td>
        <td>${moodIcon}</td>
        <td>${log.note || ''}</td>
        <td><button data-index="${index}">Delete</button></td>
      `;
  
      row.querySelector('button').addEventListener('click', () => {
        logs.splice(index, 1);
        localStorage.setItem('moodLogs', JSON.stringify(logs));
        renderJournal();
      });
  
      tbody.appendChild(row);
    });
  }
  
  
  // Chart rendering
  function renderChart() {
    const logs = JSON.parse(localStorage.getItem('moodLogs') || '[]');
    if (logs.length === 0) return;
  
    const timeBuckets = {
      Morning: [],
      Afternoon: [],
      Evening: [],
      Night: []
    };
  
    logs.forEach(log => {
      const hour = new Date(log.timestamp).getHours();
  
      if (hour >= 5 && hour <= 11) {
        timeBuckets.Morning.push(log.mood);
      } else if (hour >= 12 && hour <= 17) {
        timeBuckets.Afternoon.push(log.mood);
      } else if (hour >= 18 && hour <= 21) {
        timeBuckets.Evening.push(log.mood);
      } else {
        timeBuckets.Night.push(log.mood); // 10 PM – 4 AM
      }
    });
  
    const labels = [];
    const data = [];
  
    for (const [label, moods] of Object.entries(timeBuckets)) {
      if (moods.length > 0) {
        labels.push(label);
        const avg = moods.reduce((a, b) => a + b, 0) / moods.length;
        data.push(avg);
      }
    }
  
    if (window.moodChart && typeof window.moodChart.destroy === 'function') {
      window.moodChart.destroy();
    }
  
    window.moodChart = new Chart(chartCtx, {
      type: 'bar',
      data: {
        labels,
        datasets: [{
          label: 'Average Mood by Time of Day',
          data,
          backgroundColor: data.map(val => {
            const colors = {
              1: '#ef4444',  // red
              2: '#f97316',  // orange
              3: '#facc15',  // yellow
              4: '#4ade80',  // light green
              5: '#22c55e'   // green
            };
            return colors[Math.round(val)];
          }),          
          borderRadius: 10
        }]
      },
      options: {
        scales: {
          y: {
            min: 1,
            max: 5,
            // reverse: true,
            ticks: {
              stepSize: 1,
              callback: (value) => ["", "😄", "🙂", "😐", "😟", "😢"][value]
            }
          }
        },
        plugins: {
          tooltip: {
            callbacks: {
              label: (ctx) =>
                `Mood: ${["", "😢", "😟", "😐", "🙂", "😄"][Math.round(ctx.raw)]}`
            }
          }
        }
      }
    });
  }
  
  
  

  renderChart(); // Draw chart on load
});
