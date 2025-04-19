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
                `Mood: ${["", "😄", "🙂", "😐", "😟", "😢"][Math.round(ctx.raw)]}`
            }
          }
        }
      }
    });
  }
  
  
  

  renderChart(); // Draw chart on load
});
