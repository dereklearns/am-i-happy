document.addEventListener('DOMContentLoaded', () => {
  let selectedMood = null;
  const moodButtons = document.querySelectorAll('.emoji-picker button');
  const noteInput = document.getElementById('note');
  const logBtn = document.getElementById('log-btn');
  const chartCtx = document.getElementById('moodChart').getContext('2d');

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

  // Chart rendering
  function renderChart() {
    const logs = JSON.parse(localStorage.getItem('moodLogs') || '[]');
    if (logs.length === 0) return;
  
    const grouped = {};
    logs.forEach(log => {
      grouped[log.date] = log.mood; // One mood per day
    });
  
    const labels = Object.keys(grouped).sort();
    const data = labels.map(date => grouped[date]);
  
    if (window.moodChart && typeof window.moodChart.destroy === 'function') {
      window.moodChart.destroy();
    }
  
    window.moodChart = new Chart(chartCtx, {
      type: 'line',
      data: {
        labels,
        datasets: [{
          label: 'Mood Over Time',
          data,
          borderWidth: 2,
          borderColor: '#0077ff',
          fill: false,
          tension: 0.3
        }]
      },
      options: {
        scales: {
          y: {
            min: 1,
            max: 5,
            ticks: {
              stepSize: 1,
              callback: (value) => ["", "😢", "😟", "😐", "🙂", "😄"][value]
            }
          }
        }
      }
    });
  }
  

  renderChart(); // Draw chart on load
});
