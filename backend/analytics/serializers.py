# .\academic_system\backend\analytics\serializers.py
from rest_framework import serializers

class StudentAnalysisSerializer(serializers.Serializer):
    student_name = serializers.CharField()
    overall_performance = serializers.FloatField()
    strengths = serializers.ListField(child=serializers.CharField())
    areas_for_improvement = serializers.ListField(child=serializers.CharField())
    comparative_analysis = serializers.DictField()
    learning_patterns = serializers.DictField()

class CourseStatisticsSerializer(serializers.Serializer):
    course_average = serializers.FloatField()
    grade_distribution = serializers.DictField()
    performance_metrics = serializers.DictField()