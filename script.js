function run() {
  const scriptTag = document.getElementById('__NEXT_DATA__');
  if (scriptTag) {
    const data = JSON.parse(scriptTag.textContent);
    const jobs = data.props.pageProps.initialJobs;

    let jobElements = [];

    chrome.storage.sync.get(['rejectedJobs'], function(result) {
      const rejectedJobs = result.rejectedJobs || [];

      jobs.forEach(job => {
        const jobCard = document.querySelector(`div[data-cy="job-card"][id="${job.id}"]`);
        if (jobCard) {
          jobCard.querySelectorAll('.g2i-enhancer').forEach(el => el.remove());

          const dateElement = document.createElement('div');
          const jobDate = new Date(job.created_at);
          dateElement.textContent = `${jobDate.toLocaleDateString('pl-PL')}`;
          dateElement.className = "whitespace-nowrap g2i-enhancer"
          jobCard.appendChild(dateElement);

          // Create Reject and Undo buttons
          const rejectButton = document.createElement('button');
          rejectButton.className = 'g2i-enhancer'
          rejectButton.textContent = 'Reject';
          rejectButton.style.marginRight = '5px';
          rejectButton.dataset.fromExtension = 'true';
          const undoButton = document.createElement('button');
          undoButton.className = 'g2i-enhancer'
          undoButton.textContent = 'Undo';
          undoButton.style.display = 'none'; // Hide Undo initially
          undoButton.dataset.fromExtension = 'true';

          // Append buttons to job card
          if (!['https://portal.g2i.co/jobs?filter=all', 'https://portal.g2i.co/jobs?filter=applied'].includes(window.location.href)) {
            jobCard.appendChild(rejectButton);
            jobCard.appendChild(undoButton);
          }

          // Check if the current job is in the rejected list
          if (rejectedJobs.includes(job.id)) {
            jobCard.style.opacity = '0.2';
            rejectButton.style.display = 'none';
            undoButton.style.display = 'inline';
          }

          // Event Listener for Reject button
          rejectButton.addEventListener('click', () => {
            jobCard.style.opacity = '0.2'; // Mark as rejected
            rejectButton.style.display = 'none';
            undoButton.style.display = 'inline';

            // Update storage
            rejectedJobs.push(job.id);
            chrome.storage.sync.set({rejectedJobs: rejectedJobs});
          });

          // Event Listener for Undo button
          undoButton.addEventListener('click', () => {
            jobCard.style.opacity = '1'; // Restore opacity
            undoButton.style.display = 'none';
            rejectButton.style.display = 'inline';

            // Update storage
            const index = rejectedJobs.indexOf(job.id);
            if (index > -1) {
              rejectedJobs.splice(index, 1);
              chrome.storage.sync.set({rejectedJobs: rejectedJobs});
            }
          });

          const parentLi = jobCard.closest('li');
          if (parentLi) {
            jobElements.push({element: parentLi, date: jobDate});
          }
        }
      });

      // Sort the job elements by date in descending order
      jobElements.sort((a, b) => b.date - a.date);

      // Find the parent 'ul' and append the sorted 'li' elements
      const parentUl = jobElements.length > 0 ? jobElements[0].element.closest('ul') : null;
      if (parentUl) {
        jobElements.forEach(jobEl => {
          parentUl.appendChild(jobEl.element);
        });
      }
    });
  }
}

run()