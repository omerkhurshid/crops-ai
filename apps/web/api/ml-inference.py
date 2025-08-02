"""
Advanced ML Inference API using Python
Provides serverless ML model inference capabilities using scikit-learn and numpy
for agricultural data analysis that requires advanced statistical processing.
"""

import json
import numpy as np
from typing import Dict, List, Any, Optional, Tuple
from http.server import BaseHTTPRequestHandler
import traceback


class MLInference:
    """
    Machine Learning inference handler for agricultural predictions
    """
    
    def __init__(self):
        self.models = {}
        self.feature_scalers = {}
        self.crop_encoders = {}
        self.load_models()
    
    def load_models(self):
        """Load pre-trained models and scalers"""
        # Simulate loading pre-trained models
        # In production, these would be loaded from cloud storage
        
        # Yield prediction model weights (Random Forest simulation)
        self.models['yield_rf'] = {
            'n_estimators': 100,
            'feature_weights': {
                'weather_temp': 0.15,
                'weather_rainfall': 0.25, 
                'weather_humidity': 0.08,
                'weather_gdd': 0.20,
                'soil_ph': 0.10,
                'soil_om': 0.12,
                'soil_n': 0.18,
                'soil_p': 0.08,
                'satellite_ndvi': 0.30,
                'satellite_evi': 0.15,
                'field_area': 0.05,
                'planting_doy': 0.08
            },
            'base_yield': 8.5,
            'crop_factors': {
                'corn': 1.0,
                'soybean': 0.7,
                'wheat': 0.9,
                'rice': 1.1
            }
        }
        
        # Feature scalers (mean and std for normalization)
        self.feature_scalers = {
            'weather_temp': {'mean': 20.0, 'std': 8.0},
            'weather_rainfall': {'mean': 500.0, 'std': 200.0},
            'weather_humidity': {'mean': 65.0, 'std': 15.0},
            'weather_gdd': {'mean': 1500.0, 'std': 400.0},
            'soil_ph': {'mean': 6.8, 'std': 0.8},
            'soil_om': {'mean': 3.0, 'std': 1.5},
            'soil_n': {'mean': 30.0, 'std': 15.0},
            'soil_p': {'mean': 25.0, 'std': 10.0},
            'satellite_ndvi': {'mean': 0.7, 'std': 0.2},
            'satellite_evi': {'mean': 0.5, 'std': 0.15},
            'field_area': {'mean': 100.0, 'std': 50.0},
            'planting_doy': {'mean': 120.0, 'std': 30.0}
        }
    
    def predict_yield(self, features: Dict[str, float], crop_type: str = 'corn') -> Dict[str, Any]:
        """
        Predict crop yield using Random Forest simulation
        
        Args:
            features: Dictionary of feature values
            crop_type: Type of crop being predicted
            
        Returns:
            Dictionary containing prediction results
        """
        try:
            model = self.models['yield_rf']
            
            # Normalize features
            normalized_features = {}
            for feature, value in features.items():
                if feature in self.feature_scalers:
                    scaler = self.feature_scalers[feature]
                    normalized_features[feature] = (value - scaler['mean']) / scaler['std']
                else:
                    normalized_features[feature] = value
            
            # Calculate prediction using weighted sum
            prediction = model['base_yield']
            total_weight = 0
            
            for feature, weight in model['feature_weights'].items():
                if feature in normalized_features:
                    prediction += normalized_features[feature] * weight
                    total_weight += abs(weight)
            
            # Apply crop type factor
            crop_factor = model['crop_factors'].get(crop_type.lower(), 1.0)
            prediction *= crop_factor
            
            # Ensure non-negative prediction
            prediction = max(0, prediction)
            
            # Calculate confidence based on feature completeness
            feature_completeness = len([f for f in model['feature_weights'].keys() 
                                      if f in features]) / len(model['feature_weights'])
            confidence = min(0.95, 0.6 + feature_completeness * 0.35)
            
            # Calculate uncertainty bounds
            uncertainty_factor = 1 - confidence
            lower_bound = prediction * (1 - uncertainty_factor * 0.2)
            upper_bound = prediction * (1 + uncertainty_factor * 0.2)
            
            # Feature importance for this prediction
            feature_importance = {}
            for feature, weight in model['feature_weights'].items():
                if feature in normalized_features:
                    contribution = abs(normalized_features[feature] * weight)
                    feature_importance[feature] = contribution / total_weight if total_weight > 0 else 0
            
            return {
                'predicted_yield': round(prediction, 2),
                'confidence': round(confidence, 3),
                'uncertainty': {
                    'lower_bound': round(lower_bound, 2),
                    'upper_bound': round(upper_bound, 2),
                    'std_deviation': round(prediction * uncertainty_factor * 0.1, 2)
                },
                'feature_importance': feature_importance,
                'model_info': {
                    'model_type': 'random_forest_simulation',
                    'crop_type': crop_type,
                    'base_yield': model['base_yield'],
                    'crop_factor': crop_factor
                }
            }
            
        except Exception as e:
            raise Exception(f"Yield prediction failed: {str(e)}")
    
    def analyze_stress_patterns(self, satellite_data: List[Dict]) -> Dict[str, Any]:
        """
        Analyze crop stress patterns from satellite time series data
        
        Args:
            satellite_data: List of satellite observations with NDVI, date, etc.
            
        Returns:
            Dictionary containing stress analysis results
        """
        try:
            if not satellite_data:
                raise ValueError("No satellite data provided")
            
            # Extract NDVI values and dates
            ndvi_values = []
            dates = []
            
            for obs in satellite_data:
                if 'ndvi' in obs and 'date' in obs:
                    ndvi_values.append(obs['ndvi'])
                    dates.append(obs['date'])
            
            if len(ndvi_values) < 3:
                raise ValueError("At least 3 observations required for stress analysis")
            
            ndvi_array = np.array(ndvi_values)
            
            # Calculate stress indicators
            mean_ndvi = np.mean(ndvi_array)
            std_ndvi = np.std(ndvi_array)
            min_ndvi = np.min(ndvi_array)
            max_ndvi = np.max(ndvi_array)
            
            # Trend analysis (simple linear regression)
            x = np.arange(len(ndvi_array))
            slope = np.polyfit(x, ndvi_array, 1)[0]
            
            # Stress level classification
            if mean_ndvi > 0.7:
                stress_level = 'low'
            elif mean_ndvi > 0.5:
                stress_level = 'moderate'
            elif mean_ndvi > 0.3:
                stress_level = 'high'
            else:
                stress_level = 'severe'
            
            # Anomaly detection (values beyond 2 standard deviations)
            anomalies = []
            threshold = 2 * std_ndvi
            for i, (value, date) in enumerate(zip(ndvi_values, dates)):
                if abs(value - mean_ndvi) > threshold:
                    anomalies.append({
                        'date': date,
                        'ndvi': value,
                        'deviation': abs(value - mean_ndvi),
                        'type': 'low' if value < mean_ndvi else 'high'
                    })
            
            # Trend classification
            if slope > 0.01:
                trend = 'improving'
            elif slope < -0.01:
                trend = 'declining'
            else:
                trend = 'stable'
            
            # Variability analysis
            coefficient_of_variation = std_ndvi / mean_ndvi if mean_ndvi > 0 else 0
            
            return {
                'stress_level': stress_level,
                'confidence': min(0.95, 0.7 + (1 - coefficient_of_variation) * 0.25),
                'statistics': {
                    'mean_ndvi': round(mean_ndvi, 3),
                    'std_ndvi': round(std_ndvi, 3),
                    'min_ndvi': round(min_ndvi, 3),
                    'max_ndvi': round(max_ndvi, 3),
                    'coefficient_of_variation': round(coefficient_of_variation, 3)
                },
                'trend': {
                    'direction': trend,
                    'slope': round(slope, 4),
                    'significance': 'high' if abs(slope) > 0.02 else 'moderate' if abs(slope) > 0.005 else 'low'
                },
                'anomalies': anomalies,
                'recommendations': self._generate_stress_recommendations(stress_level, trend, anomalies),
                'analysis_info': {
                    'observations': len(ndvi_values),
                    'date_range': f"{dates[0]} to {dates[-1]}",
                    'method': 'statistical_analysis'
                }
            }
            
        except Exception as e:
            raise Exception(f"Stress pattern analysis failed: {str(e)}")
    
    def optimize_irrigation(self, field_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Optimize irrigation scheduling based on field conditions
        
        Args:
            field_data: Dictionary containing field conditions and constraints
            
        Returns:
            Dictionary containing irrigation optimization results
        """
        try:
            # Extract field parameters
            soil_moisture = field_data.get('soil_moisture', 0.3)
            crop_stage = field_data.get('crop_stage', 'vegetative')
            weather_forecast = field_data.get('weather_forecast', [])
            field_capacity = field_data.get('field_capacity', 0.4)
            wilting_point = field_data.get('wilting_point', 0.15)
            
            # Calculate available water
            available_water = max(0, soil_moisture - wilting_point)
            max_available = field_capacity - wilting_point
            water_stress_level = available_water / max_available if max_available > 0 else 0
            
            # Crop water requirements by stage
            water_requirements = {
                'germination': 0.3,
                'emergence': 0.4,
                'vegetative': 0.6,
                'flowering': 0.8,
                'fruiting': 0.7,
                'maturity': 0.4
            }
            
            base_requirement = water_requirements.get(crop_stage, 0.6)
            
            # Weather-based adjustments
            expected_rainfall = 0
            avg_temp = 25
            avg_humidity = 60
            
            if weather_forecast:
                expected_rainfall = sum(day.get('precipitation', 0) for day in weather_forecast[:7])
                temperatures = [day.get('temperature', 25) for day in weather_forecast[:7]]
                humidities = [day.get('humidity', 60) for day in weather_forecast[:7]]
                avg_temp = np.mean(temperatures)
                avg_humidity = np.mean(humidities)
            
            # Calculate irrigation need
            evapotranspiration_factor = 1.0
            if avg_temp > 30:
                evapotranspiration_factor += 0.2
            elif avg_temp < 15:
                evapotranspiration_factor -= 0.2
            
            if avg_humidity > 80:
                evapotranspiration_factor -= 0.1
            elif avg_humidity < 40:
                evapotranspiration_factor += 0.1
            
            adjusted_requirement = base_requirement * evapotranspiration_factor
            
            # Irrigation scheduling
            if water_stress_level < 0.3:
                urgency = 'critical'
                recommended_amount = (field_capacity - soil_moisture) * 1000  # mm
                timing = 'immediate'
            elif water_stress_level < 0.5:
                urgency = 'high'
                recommended_amount = (field_capacity - soil_moisture) * 800
                timing = 'within_24h'
            elif water_stress_level < 0.7:
                urgency = 'moderate'
                recommended_amount = adjusted_requirement * 600
                timing = 'within_3_days'
            else:
                urgency = 'low'
                recommended_amount = 0
                timing = 'monitor'
            
            # Adjust for expected rainfall
            if expected_rainfall > recommended_amount * 0.8:
                recommended_amount = 0
                timing = 'delay_for_rain'
                urgency = 'low'
            elif expected_rainfall > 0:
                recommended_amount = max(0, recommended_amount - expected_rainfall)
            
            # Efficiency optimization
            efficiency_tips = []
            if urgency in ['critical', 'high']:
                efficiency_tips.append('Apply during early morning or evening to reduce evaporation')
            if avg_temp > 30:
                efficiency_tips.append('Consider mulching to retain soil moisture')
            if expected_rainfall > 10:
                efficiency_tips.append('Delay irrigation until after expected rainfall')
            
            return {
                'irrigation_needed': recommended_amount > 0,
                'recommended_amount': round(recommended_amount, 1),
                'urgency': urgency,
                'timing': timing,
                'water_stress_level': round(water_stress_level, 2),
                'current_conditions': {
                    'soil_moisture': soil_moisture,
                    'available_water_percent': round(water_stress_level * 100, 1),
                    'crop_stage': crop_stage
                },
                'weather_factors': {
                    'expected_rainfall_7d': round(expected_rainfall, 1),
                    'avg_temperature': round(avg_temp, 1),
                    'avg_humidity': round(avg_humidity, 1),
                    'evapotranspiration_factor': round(evapotranspiration_factor, 2)
                },
                'efficiency_tips': efficiency_tips,
                'optimization_info': {
                    'base_requirement': base_requirement,
                    'adjusted_requirement': round(adjusted_requirement, 2),
                    'method': 'water_balance_model'
                }
            }
            
        except Exception as e:
            raise Exception(f"Irrigation optimization failed: {str(e)}")
    
    def _generate_stress_recommendations(self, stress_level: str, trend: str, anomalies: List) -> List[str]:
        """Generate recommendations based on stress analysis"""
        recommendations = []
        
        if stress_level == 'severe':
            recommendations.append('Immediate irrigation required to prevent crop damage')
            recommendations.append('Consider emergency nutrient application')
            recommendations.append('Investigate potential pest or disease issues')
        elif stress_level == 'high':
            recommendations.append('Increase irrigation frequency')
            recommendations.append('Monitor for pest and disease pressure')
            recommendations.append('Consider stress-reducing treatments')
        elif stress_level == 'moderate':
            recommendations.append('Optimize irrigation timing')
            recommendations.append('Monitor crop development closely')
        
        if trend == 'declining':
            recommendations.append('Investigate causes of declining vegetation health')
            recommendations.append('Consider soil testing for nutrient deficiencies')
        elif trend == 'improving':
            recommendations.append('Continue current management practices')
        
        if len(anomalies) > 2:
            recommendations.append('High variability detected - investigate field uniformity')
            recommendations.append('Consider precision management approaches')
        
        return recommendations


class Handler(BaseHTTPRequestHandler):
    """
    HTTP request handler for Vercel serverless function
    """
    
    def __init__(self, *args, **kwargs):
        self.ml_inference = MLInference()
        super().__init__(*args, **kwargs)
    
    def do_POST(self):
        """Handle POST requests"""
        try:
            # Read request data
            content_length = int(self.headers['Content-Length'])
            post_data = self.rfile.read(content_length)
            request_data = json.loads(post_data.decode('utf-8'))
            
            # Get action from request
            action = request_data.get('action', '')
            
            if action == 'predict_yield':
                result = self.handle_yield_prediction(request_data)
            elif action == 'analyze_stress':
                result = self.handle_stress_analysis(request_data)
            elif action == 'optimize_irrigation':
                result = self.handle_irrigation_optimization(request_data)
            else:
                raise ValueError(f"Unknown action: {action}")
            
            # Send successful response
            self.send_response(200)
            self.send_header('Content-Type', 'application/json')
            self.send_header('Access-Control-Allow-Origin', '*')
            self.send_header('Access-Control-Allow-Methods', 'POST, OPTIONS')
            self.send_header('Access-Control-Allow-Headers', 'Content-Type')
            self.end_headers()
            
            response = {
                'success': True,
                'data': result,
                'timestamp': np.datetime64('now').astype(str)
            }
            
            self.wfile.write(json.dumps(response).encode())
            
        except Exception as e:
            # Send error response
            self.send_response(500)
            self.send_header('Content-Type', 'application/json')
            self.send_header('Access-Control-Allow-Origin', '*')
            self.end_headers()
            
            error_response = {
                'success': False,
                'error': str(e),
                'traceback': traceback.format_exc(),
                'timestamp': np.datetime64('now').astype(str)
            }
            
            self.wfile.write(json.dumps(error_response).encode())
    
    def do_OPTIONS(self):
        """Handle CORS preflight requests"""
        self.send_response(200)
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        self.end_headers()
    
    def handle_yield_prediction(self, request_data: Dict) -> Dict:
        """Handle yield prediction requests"""
        features = request_data.get('features', {})
        crop_type = request_data.get('crop_type', 'corn')
        
        if not features:
            raise ValueError("Features are required for yield prediction")
        
        return self.ml_inference.predict_yield(features, crop_type)
    
    def handle_stress_analysis(self, request_data: Dict) -> Dict:
        """Handle stress analysis requests"""
        satellite_data = request_data.get('satellite_data', [])
        
        if not satellite_data:
            raise ValueError("Satellite data is required for stress analysis")
        
        return self.ml_inference.analyze_stress_patterns(satellite_data)
    
    def handle_irrigation_optimization(self, request_data: Dict) -> Dict:
        """Handle irrigation optimization requests"""
        field_data = request_data.get('field_data', {})
        
        if not field_data:
            raise ValueError("Field data is required for irrigation optimization")
        
        return self.ml_inference.optimize_irrigation(field_data)


def handler(request, context):
    """
    Vercel serverless function entry point
    """
    try:
        ml_inference = MLInference()
        
        # Parse request
        if request.method == 'OPTIONS':
            return {
                'statusCode': 200,
                'headers': {
                    'Access-Control-Allow-Origin': '*',
                    'Access-Control-Allow-Methods': 'POST, OPTIONS',
                    'Access-Control-Allow-Headers': 'Content-Type'
                }
            }
        
        if request.method != 'POST':
            return {
                'statusCode': 405,
                'headers': {'Content-Type': 'application/json'},
                'body': json.dumps({'error': 'Method not allowed'})
            }
        
        # Get request data
        request_data = json.loads(request.body) if hasattr(request, 'body') else {}
        action = request_data.get('action', '')
        
        # Route to appropriate handler
        if action == 'predict_yield':
            features = request_data.get('features', {})
            crop_type = request_data.get('crop_type', 'corn')
            result = ml_inference.predict_yield(features, crop_type)
            
        elif action == 'analyze_stress':
            satellite_data = request_data.get('satellite_data', [])
            result = ml_inference.analyze_stress_patterns(satellite_data)
            
        elif action == 'optimize_irrigation':
            field_data = request_data.get('field_data', {})
            result = ml_inference.optimize_irrigation(field_data)
            
        else:
            raise ValueError(f"Unknown action: {action}")
        
        return {
            'statusCode': 200,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps({
                'success': True,
                'data': result,
                'timestamp': str(np.datetime64('now'))
            })
        }
        
    except Exception as e:
        return {
            'statusCode': 500,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps({
                'success': False,
                'error': str(e),
                'traceback': traceback.format_exc()
            })
        }