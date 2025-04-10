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
