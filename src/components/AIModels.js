import React from 'react';

const AIModels = () => {
  return (
    <div className="bg-white shadow-md rounded-lg p-4">
      <h2 className="text-xl font-bold text-gray-800 mb-4">THRIVE360 AI Models</h2>
      
      {/* Introduction Section 
      Some Technical terms in this section with meanings or documentation links:
      1) Machine Learning-"https://www.ibm.com/cloud/learn/machine-learning"
      */}
      <div className="mb-6">
        <div className="flex items-center mb-4">
          <div className="bg-purple-100 p-2 rounded-full mr-3">
            <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path>
            </svg>
          </div>
          <h3 className="text-lg font-semibold">Stock-Out Prediction Models</h3>
        </div>
        <p className="text-gray-700 mb-2">Our machine learning models predict stock-out probability risk based on historical data, enabling proactive supply chain management.</p>
        <p className="text-gray-700">These models identify various risk situations including under-stress stocks, cold chain issues, pipeline anomalies, and potential impacts from outbreaks.</p>
      </div>
      
      {/* Goals Section 
      Some Technical terms in this section with meanings or documentation links:
      1) Stock-Out - A supply chain term referring to inventory running out.
      2) Cold Chain - A temperature-controlled supply chain for sensitive goods like vaccines.
      3) Pipeline Anomalies - Disruptions or irregularities in supply chain processes.
      4) Seasonal Variations - Fluctuations in supply/demand influenced by seasons.
      */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-3 border-b pb-2">Goals of the Models</h3>
        <ul className="list-disc pl-5 space-y-2 text-gray-700">
          <li>Predict stock-out probability risk based on historical data</li>
          <li>Identify stock risk situations (under-stress stocks, cold chain issues, pipeline anomalies, outbreaks)</li>
          <li>Optimize supply chains to improve immunization coverage and reduce vaccine wastage</li>
          <li>Analyze the impact of seasonal variations on vaccine availability</li>
          <li>Enhance route optimization for vaccine deliveries</li>
        </ul>
      </div>
      
      {/* Model Accuracy Table 
      Some Technical terms in this section with meanings or documentation links:
      1) Model Evaluation Metrics - "https://www.geeksforgeeks.org/metrics-for-machine-learning-model/"
      2) Accuracy - The ratio of correctly predicted observations to total observations.
      3) Precision - The ratio of true positive observations to predicted positives.
      4) Recall - The ratio of true positives to actual positives.
      5) F1-Score - Harmonic mean of precision and recall.
      */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-3 border-b pb-2">Model Accuracy Metrics</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white border border-gray-300 rounded-lg">
            <thead>
              <tr className="bg-purple-100">
                <th className="py-3 px-4 text-left border-b border-gray-300">Vaccine Type</th>
                <th className="py-3 px-4 text-left border-b border-gray-300">Accuracy</th>
                <th className="py-3 px-4 text-left border-b border-gray-300">Precision</th>
                <th className="py-3 px-4 text-left border-b border-gray-300">Recall</th>
                <th className="py-3 px-4 text-left border-b border-gray-300">F1-Score</th>
              </tr>
            </thead>
            <tbody>
              <tr className="hover:bg-gray-50">
                <td className="py-3 px-4 border-b border-gray-300">BCG</td>
                <td className="py-3 px-4 border-b border-gray-300">98%</td>
                <td className="py-3 px-4 border-b border-gray-300">0.97</td>
                <td className="py-3 px-4 border-b border-gray-300">0.99</td>
                <td className="py-3 px-4 border-b border-gray-300">0.98</td>
              </tr>
              <tr className="hover:bg-gray-50 bg-gray-50">
                <td className="py-3 px-4 border-b border-gray-300">Penta</td>
                <td className="py-3 px-4 border-b border-gray-300">97%</td>
                <td className="py-3 px-4 border-b border-gray-300">0.96</td>
                <td className="py-3 px-4 border-b border-gray-300">0.98</td>
                <td className="py-3 px-4 border-b border-gray-300">0.97</td>
              </tr>
              <tr className="hover:bg-gray-50">
                <td className="py-3 px-4 border-b border-gray-300">OPV</td>
                <td className="py-3 px-4 border-b border-gray-300">96%</td>
                <td className="py-3 px-4 border-b border-gray-300">0.95</td>
                <td className="py-3 px-4 border-b border-gray-300">0.98</td>
                <td className="py-3 px-4 border-b border-gray-300">0.96</td>
              </tr>
              <tr className="hover:bg-gray-50 bg-gray-50">
                <td className="py-3 px-4 border-b border-gray-300">Measles</td>
                <td className="py-3 px-4 border-b border-gray-300">98%</td>
                <td className="py-3 px-4 border-b border-gray-300">0.97</td>
                <td className="py-3 px-4 border-b border-gray-300">0.99</td>
                <td className="py-3 px-4 border-b border-gray-300">0.98</td>
              </tr>
              <tr className="hover:bg-gray-50">
                <td className="py-3 px-4 border-b border-gray-300">HepB</td>
                <td className="py-3 px-4 border-b border-gray-300">100%</td>
                <td className="py-3 px-4 border-b border-gray-300">1.00</td>
                <td className="py-3 px-4 border-b border-gray-300">1.00</td>
                <td className="py-3 px-4 border-b border-gray-300">1.00</td>
              </tr>
              <tr className="hover:bg-gray-50 bg-gray-50">
                <td className="py-3 px-4 border-b border-gray-300">Rota</td>
                <td className="py-3 px-4 border-b border-gray-300">99%</td>
                <td className="py-3 px-4 border-b border-gray-300">0.98</td>
                <td className="py-3 px-4 border-b border-gray-300">1.00</td>
                <td className="py-3 px-4 border-b border-gray-300">0.99</td>
              </tr>
            </tbody>
          </table>
        </div>
        <p className="text-sm text-gray-600 mt-2">Model performance based on 80/20 train-test split with cross-validation.</p>
      </div>
      
      {/* Methodology Section 
      Some Technical terms in this section with meanings or documentation links:
      1) Data Preprocessing-"https://www.tpointtech.com/data-preprocessing-machine-learning"
      */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div className="bg-purple-50 p-4 rounded-lg">
          <h3 className="text-md font-semibold mb-3 text-purple-800">Data Preprocessing</h3>
          <ul className="list-disc pl-5 space-y-1 text-gray-700 text-sm">
            <li>Created relationships between datasets using unique store IDs</li>
            <li>Added store location information (coordinates, hierarchical structure)</li>
            <li>Defined stock-out conditions (stock below minimum threshold)</li>
            <li>Incorporated 3-month utilization trends for each vaccine</li>
            <li>Integrated weather patterns (rainy/dry seasons, extreme events)</li>
          </ul>
        </div>
        <div className="bg-purple-50 p-4 rounded-lg">
          <h3 className="text-md font-semibold mb-3 text-purple-800">Challenges Addressed</h3>
          <ul className="list-disc pl-5 space-y-1 text-gray-700 text-sm">
            <li>Store distribution complexity not correlated with geographical size</li>
            <li>Varying distribution structures affecting lead time</li>
            <li>Data imbalance and gaps at the facility level</li>
            <li>Seasonal variations in vaccine demand and supply chain disruptions</li>
          </ul>
        </div>
      </div>
      
      {/* ML Solutions Section
      Some Technical terms in this section with meanings or documentation links:
      1) One-Hot Encoding-"https://medium.com/@heyamit10/one-hot-encoding-explained-0b0130ccd78e"
      2) SMOTE-"https://www.geeksforgeeks.org/smote-for-imbalanced-classification-with-python/"
      3) Standard Scaling-"https://www.analyticsvidhya.com/blog/2020/04/feature-scaling-machine-learning-normalization-standardization/"
      4) Random Forest Classifier-"https://www.geeksforgeeks.org/random-forest-classifier-using-scikit-learn/"
      5) Imputation - Filling missing data with substitute values.
      6) Median Imputation - Replacing missing numeric values with the median.
      7) Categorical Imputation - Replacing missing categorical values with a constant.
      */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-3 border-b pb-2">Machine Learning Solutions Applied</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <h4 className="font-medium text-purple-800 mb-2">Stock-Out Risk Calculation</h4>
            <p className="text-sm text-gray-700 mb-4">Defined stock-out risk by comparing vaccine stock levels to the minimum threshold, creating a binary target variable.</p>
            
            <h4 className="font-medium text-purple-800 mb-2">Feature Selection</h4>
            <p className="text-sm text-gray-700 mb-4">Considered geographic, store-level, and vaccine-specific attributes for comprehensive risk assessment.</p>
          </div>
          
          <div>
            <h4 className="font-medium text-purple-800 mb-2">Data Processing Techniques</h4>
            <ul className="list-disc pl-5 space-y-1 text-sm text-gray-700 mb-4">
              <li>Imputed missing values (median for numeric, constant for categorical features)</li>
              <li>Applied One-Hot Encoding for categorical variables</li>
              <li>Used Standard Scaling for numeric variables</li>
              <li>Applied SMOTE to balance classes</li>
            </ul>
            
            <h4 className="font-medium text-purple-800 mb-2">Model Training</h4>
            <p className="text-sm text-gray-700">Trained a separate Random Forest Classifier for each vaccine type with Grid Search for hyperparameter tuning.</p>
          </div>
        </div>
      </div>
      
      {/* Feature Importance
      Some Technical terms in this section with meanings or documentation links: 
      1) Feature Importance -"https://builtin.com/data-science/feature-importance"
      */}
      <div className="mb-4">
        <h3 className="text-lg font-semibold mb-3 border-b pb-2">Feature Importance Analysis</h3>
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="space-y-3">
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm font-medium">Utilization of vaccine</span>
                <span className="text-sm font-medium">50%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2.5">
                <div className="bg-purple-600 h-2.5 rounded-full" style={{ width: '50%' }}></div>
              </div>
            </div>
            
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm font-medium">Geographic factors</span>
                <span className="text-sm font-medium">25%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2.5">
                <div className="bg-purple-600 h-2.5 rounded-full" style={{ width: '25%' }}></div>
              </div>
            </div>
            
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm font-medium">Utilization of other vaccines</span>
                <span className="text-sm font-medium">15%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2.5">
                <div className="bg-purple-600 h-2.5 rounded-full" style={{ width: '15%' }}></div>
              </div>
            </div>
            
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm font-medium">Location-based factors</span>
                <span className="text-sm font-medium">10%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2.5">
                <div className="bg-purple-600 h-2.5 rounded-full" style={{ width: '10%' }}></div>
              </div>
            </div>
            
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm font-medium">Country Population</span>
                <span className="text-sm font-medium">5%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2.5">
                <div className="bg-purple-600 h-2.5 rounded-full" style={{ width: '5%' }}></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIModels; 