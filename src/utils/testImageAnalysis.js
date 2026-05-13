/**
 * Test Script for Dynamic Cost Estimator
 * Run this in browser console to test image analysis
 */

// Test blank image (should return ₹0)
const testBlankImage = async () => {
  console.log('Testing blank image analysis...');

  // Create a blank white image
  const canvas = document.createElement('canvas');
  canvas.width = 100;
  canvas.height = 100;
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = 'white';
  ctx.fillRect(0, 0, 100, 100);
  const blankImageUrl = canvas.toDataURL();

  const { analyzeImage, calculateDynamicCosts } = await import('./utils/imageAnalysis.js');

  const analysis = await analyzeImage(blankImageUrl);
  console.log('Blank image analysis:', analysis);

  const baseCostItems = [
    { id: 'welding-rod', name: 'Welding Rod', description: 'High-quality welding electrode', quantity: 2, unitPrice: 150 },
    { id: 'labor', name: 'Labor Cost', description: 'Skilled welder hourly rate', quantity: 4, unitPrice: 500 },
    { id: 'equipment', name: 'Equipment', description: 'Welding machine rental', quantity: 1, unitPrice: 800 }
  ];

  const costs = calculateDynamicCosts(analysis, baseCostItems);
  console.log('Blank image costs:', costs);

  return costs.totals.total === 0 ? '✅ PASS: Blank image shows ₹0' : '❌ FAIL: Blank image should show ₹0';
};

// Test damaged image (should return scaled costs)
const testDamagedImage = async () => {
  console.log('Testing damaged image analysis...');

  // Create an image with dark areas (simulating damage)
  const canvas = document.createElement('canvas');
  canvas.width = 100;
  canvas.height = 100;
  const ctx = canvas.getContext('2d');

  // Fill with light gray background
  ctx.fillStyle = '#CCCCCC';
  ctx.fillRect(0, 0, 100, 100);

  // Add some dark areas (simulating cracks)
  ctx.fillStyle = '#000000';
  ctx.fillRect(20, 20, 10, 10); // Small crack
  ctx.fillRect(50, 50, 20, 5);  // Larger damage

  const damagedImageUrl = canvas.toDataURL();

  const { analyzeImage, calculateDynamicCosts } = await import('./utils/imageAnalysis.js');

  const analysis = await analyzeImage(damagedImageUrl);
  console.log('Damaged image analysis:', analysis);

  const baseCostItems = [
    { id: 'welding-rod', name: 'Welding Rod', description: 'High-quality welding electrode', quantity: 2, unitPrice: 150 },
    { id: 'labor', name: 'Labor Cost', description: 'Skilled welder hourly rate', quantity: 4, unitPrice: 500 },
    { id: 'equipment', name: 'Equipment', description: 'Welding machine rental', quantity: 1, unitPrice: 800 }
  ];

  const costs = calculateDynamicCosts(analysis, baseCostItems);
  console.log('Damaged image costs:', costs);

  return costs.totals.total > 0 ? `✅ PASS: Damaged image shows ₹${costs.totals.total}` : '❌ FAIL: Damaged image should show costs > ₹0';
};

// Run tests
const runTests = async () => {
  console.log('🧪 Running Dynamic Cost Estimator Tests...\n');

  try {
    const blankResult = await testBlankImage();
    console.log(blankResult);

    const damagedResult = await testDamagedImage();
    console.log(damagedResult);

    console.log('\n🎉 Tests completed! Check results above.');
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
};

// Auto-run tests when script loads
if (typeof window !== 'undefined') {
  // Wait for DOM to be ready
  document.addEventListener('DOMContentLoaded', () => {
    setTimeout(runTests, 1000);
  });
}

export { testBlankImage, testDamagedImage, runTests };