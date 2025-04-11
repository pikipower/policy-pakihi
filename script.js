// Add this to your script.js file
function downloadDocx() {
  // Show loading indicator
  const loadingEl = document.createElement('div');
  loadingEl.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50';
  loadingEl.innerHTML = `
    <div class="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-xl text-center">
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
      <p>Generating your policy document...</p>
    </div>
  `;
  document.body.appendChild(loadingEl);
  
  // Original docx generation code
  const doc = new window.docx.Document();
  const selectedContent = [];
  
  for (const policyName of selectedPolicies) {
    const filename = policyFiles[policyName];
    if (!filename) continue;
    try {
      fetch(`templates/${filename}`)
        .then(response => response.text())
        .then(text => {
          selectedContent.push(new window.docx.Paragraph({ text: policyName, heading: window.docx.HeadingLevel.HEADING_1 }));
          text.split("\n").forEach((line) => {
            selectedContent.push(new window.docx.Paragraph(line));
          });
          selectedContent.push(new window.docx.Paragraph(""));
          
          // If this is the last policy, generate the document
          if (selectedContent.length === selectedPolicies.length * 3) {
            doc.addSection({ children: selectedContent });
            window.docx.Packer.toBlob(doc).then((blob) => {
              // Remove loading indicator
              document.body.removeChild(loadingEl);
              
              // Show success message
              const successEl = document.createElement('div');
              successEl.className = 'fixed bottom-4 right-4 bg-green-500 text-white p-4 rounded shadow-lg z-50';
              successEl.innerHTML = 'Document generated successfully!';
              document.body.appendChild(successEl);
              
              // Remove success message after 3 seconds
              setTimeout(() => {
                document.body.removeChild(successEl);
              }, 3000);
              
              // Download the document
              const link = document.createElement("a");
              link.href = URL.createObjectURL(blob);
              link.download = "Policy-Kete.docx";
              link.click();
            });
          }
        })
        .catch(err => {
          console.error(`Failed to load ${filename}`, err);
          document.body.removeChild(loadingEl);
          
          // Show error message
          const errorEl = document.createElement('div');
          errorEl.className = 'fixed bottom-4 right-4 bg-red-500 text-white p-4 rounded shadow-lg z-50';
          errorEl.innerHTML = `Error generating document: ${err.message}`;
          document.body.appendChild(errorEl);
          
          // Remove error message after 5 seconds
          setTimeout(() => {
            document.body.removeChild(errorEl);
          }, 5000);
        });
    } catch (err) {
      console.error(`Failed to load ${filename}`, err);
    }
  }
}


let currentStep = 0;
const sections = document.querySelectorAll("section");
const selectedPolicies = [];
const policyFiles = {
  "Governance Responsibilities": "governance.txt",
  "Volunteer Support": "volunteer.txt",
  "Privacy & Information Use": "privacy.txt",
  "Financial Management": "finance.txt",
  "Health & Safety": "health.txt"
};

function nextStep() {
  if (currentStep === 4) {
    const checkboxes = sections[currentStep].querySelectorAll("input[type='checkbox']");
    selectedPolicies.length = 0;
    checkboxes.forEach((box) => {
      if (box.checked) {
        selectedPolicies.push(box.parentElement.innerText.trim());
      }
    });
  }

  if (currentStep < sections.length - 1) {
    sections[currentStep].classList.remove("active");
    currentStep++;
    sections[currentStep].classList.add("active");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }
}

async function downloadDocx() {
  const doc = new window.docx.Document();
  const selectedContent = [];

  for (const policyName of selectedPolicies) {
    const filename = policyFiles[policyName];
    if (!filename) continue;

    try {
      const response = await fetch(`templates/${filename}`);
      const text = await response.text();
      selectedContent.push(new window.docx.Paragraph({ text: policyName, heading: window.docx.HeadingLevel.HEADING_1 }));
      text.split("\n").forEach((line) => {
        selectedContent.push(new window.docx.Paragraph(line));
      });
      selectedContent.push(new window.docx.Paragraph(""));
    } catch (err) {
      console.error(`Failed to load ${filename}`, err);
    }
  }

  doc.addSection({ children: selectedContent });

  window.docx.Packer.toBlob(doc).then((blob) => {
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "Policy-Kete.docx";
    link.click();
  });
}
