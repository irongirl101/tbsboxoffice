from django.urls import path
from . import views

urlpatterns=[
    path('',views.home,name='events'),
    path('book/<str:pk>/',views.hallplan,name='hallplan'),
    path('ticket/<str:pk>/',views.ticket,name='ticket'),
    path('cancel/<str:pk>/',views.cancel,name='cancel'),
    path('seatdetails/<str:pk>/',views.seatdetails,name='seatdetails'),
    path('resend/<str:pk>/',views.resend,name='resend'),
    path('report/<str:pk>/',views.report,name='info'),
    path('reserve/<str:pk>/',views.reserve,name='reserve'),
    path('notify/<str:pk>/',views.notify,name='notify'),
    path('cancelnotify/<str:pk>/',views.cancelnotify,name='cancelnotify'),
    path('cancelreserve/<str:pk>/',views.cancelreserve,name='cancelreserve'),
]
