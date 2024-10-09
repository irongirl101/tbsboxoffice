from datetime import *
from django.utils import timezone
from io import BytesIO
import json
from django.http import HttpResponse
from django.shortcuts import render,redirect
from homepage.models import linkage, Family, events, General
from django.contrib.auth.decorators import login_required,user_passes_test
import urllib.parse
import qrcode
import base64
#from django.core.mail import send_mail
import ezgmail

@login_required(login_url='home') #just in case.
def home(request):
    context={'reports':False}
    if request.user.is_superuser:
        myevents=events.objects.all()
        context["reports"]=True
    else:
        GI, created = General.objects.get_or_create(pk=1)
        GI.logins+=1
        GI.save()
        myevents=[i.event for i in request.user.linkage_set.all()]#here I get only the events that belong to the user that has currently logged in
    context['Events']=myevents
    return(render(request,'hi2.html',context))

@login_required(login_url='home') #just in case.
def hallplan(request,pk):
    context={'pk':pk}
    if request.user.is_superuser:
        return(redirect(f'/events/seatdetails/{pk}/'))
    else:
        try:
            event=(request.user.linkage_set.get(event__event=pk)).event #event__event is accessing that event(foriegn key)s event(attribute(name))
        except:
            return(redirect('home'))
        event.entered=event.entered+1
        event.save()
        context['allbooked']=(len(event.blocked.split(','))-1==476) #-1 is due to last comma being extra. This is so that we can see if all seats are taken.
        curlinkage=linkage.objects.get(user=request.user,event=event)
        if curlinkage.seats:#if already booked, send to ticket.
            return(redirect(f"/events/ticket/{pk}"))
        #Checking if the user has siblings that have booked in the same event.
        fam=Family.objects.get(user=request.user)
        sib=linkage.objects.filter(fami__Parent1=fam.Parent1,fami__Parent2=fam.Parent2,fami__Guardians=fam.Guardians,event=event)
        maxseats=curlinkage.maxseats
        for i in sib:
            if i.seats is not None:
                if curlinkage.event.siblingsbooked and f"{curlinkage.user.username}:{i.user.username}" not in curlinkage.event.siblingsbooked.split(','):
                    curlinkage.event.siblingsbooked+=f"{curlinkage.user.username}:{i.user.username},"
                    curlinkage.event.save()
                    return(render(request,'siblings.html',{'i':i}))
                else:
                    return(render(request,'siblings.html',{'i':i}))
            if event not in [i.event for i in request.user.linkage_set.all()]: #just in case
                return(redirect('home'))
        if request.method == "POST":
                    seats = request.POST.get('seats')  # Get selected seat IDs from POST data
                    seats=seats.strip('"')+','
                    event=(request.user.linkage_set.get(event__event=pk)).event#refreshing, to check real time, if anyone has booked that justt before this person booked.
                    if seats in event.blocked:#If somehow the seats have actually gotten booked just before the person clicked book, then reload the page.
                        return(redirect(f"/events/{event.red}"))
                    curlinkage.seats=seats
                    curlinkage.save()
                    taken=event.blocked
                    if taken == None:
                        taken=seats
                    else:
                        taken+=seats
                    event.blocked=taken
                    event.save()
                    GI, created = General.objects.get_or_create(pk=1)
                    GI.SeatsBooked+=1
                    GI.save()
                    return(redirect(f"/events/ticket/{pk}"))
        #see if you can make this more efficient.
        d={"maxseats":maxseats,"A":[],"B":[],"C":[],"D":[],"E":[],"F":[],"G":[],"H":[],"I":[],"J":[],"K":[],"L":[],"M":[],"N":[],"O":[],"AA":[],"BB":[],"CC":[],"DD":[],"EE":[],"FF":[]}
        #keeping default empty values for all so that it can easily be accesed in js without having to worry wether the key exists.
        s=event.blocked
        l=s.split(',')
        l.pop()
        for i in l: 
            for j in range(len(i)):
                if i[j].isdigit():
                    try:
                        temp=d[i[:j]]
                        temp.append(int(i[j:]))
                        d[i[:j]]=temp
                    except:
                        #this shouldnt happen but just in case the admin has entered some bad data in the blocked.
                        d[i[:j]]=[int(i[j:])]
                    break
        d=json.dumps(d).replace("'", '"') #replaces the '' in the dict to "" so that we can pass it to the js (through the html.)
        context['blocked']=d
        context['event']=event
        return(render(request,'audi.html',context))
    
@login_required(login_url='home')
def ticket(request,pk):
    try:
        event=(request.user.linkage_set.get(event__event=pk)).event #event__event is accessing that event(foriegn key)s event(attribute(name))
    except:
        return(redirect('home'))
    curlinkage=linkage.objects.get(user=request.user,event=event)
    if event not in [i.event for i in request.user.linkage_set.all()]:
        return(redirect('home'))
    if curlinkage.seats==None:#if not booked, send home.
        return(redirect('home'))
    if event.notifymail and request.user.email in event.notifymail.split(','): #if the user has asked to notify and has now gotten a seat/seats, remove his name from notify.
        temp=event.notifymail
        event.notifymail=temp.replace(request.user.email,'')
        event.save()
    url="127.0.0.1:8000/"+urllib.parse.quote(f'details/{curlinkage}')#HERE, THE 127.0.0.1:8000 WILL HAVE TO BE CHANGED TO THE DOMAIN.
    img=qrcode.make(url) #this is a PILImage.
    buffered = BytesIO()#this will be the image as a string. need the bytes as that way, i can encode the pilimage into bytes
    #and then decode that into a string.
    img.save(buffered) #saving image into buffered. (as bytes prolly.)
    image_str = base64.b64encode(buffered.getvalue()).decode() #making the image into a string that can be sent and rendered in ticket.
    context={'Event':event,'EventDeets':event.Date,'desc':event.Desc,'seats':curlinkage.seats,'bookedwhen':curlinkage.whenbooked.strftime("%d/%m/%Y, %H:%M:%S"),'QR':image_str,'pk':pk,'email':request.user.email}
    if curlinkage.emailsent==None:#if email has not been sent, send an email.
        #Sending the email from suadnastorage.
        subject=f"Your ticket for {event} on {event.Date.strftime('%d/%m/%Y, %H:%M:%S')}"
        message=f"Ticket: \n\n Link: 127.0.0.1:8000/events/ticket/{urllib.parse.quote(pk)}/ \n\n Event: {event} \n\n Date and time: {event.Date.strftime('%d/%m/%Y, %H:%M:%S')} \n\n Description: {event.Desc} \n\n Your seats: {curlinkage.seats} \n\n For QR code, please visit the link. \n\n Booked on: {curlinkage.whenbooked.strftime('%d/%m/%Y, %H:%M:%S')} \n\n For any queries, please contact the school."
        #fromwhom='suadnastorage@gmail.com'
        recipients=request.user.email
        ezgmail.send(recipients, subject=subject, body=message)
        GI, created = General.objects.get_or_create(pk=1)
        GI.emailsent+=1
        GI.save()
        #send_mail(subject, message, fromwhom, recipients,fail_silently=False)
        curlinkage.emailsent=timezone.now()
        curlinkage.save()
    return(render(request,'ticket.html',context))

@login_required(login_url='home')
def resend(request,pk):
    try:
        event=(request.user.linkage_set.get(event__event=pk)).event #event__event is accessing that event(foriegn key)s event(attribute(name))
    except:
        return(redirect('home'))
    curlinkage=linkage.objects.get(user=request.user,event=event)
    if event not in [i.event for i in request.user.linkage_set.all()]:
        return(redirect('home'))
    if curlinkage.seats==None:#if not booked, send home.
        return(redirect('home'))
    #Sending the email from suadnastorage.
    subject=f"Your ticket for {event} on {event.Date.strftime('%d/%m/%Y, %H:%M:%S')}"
    message=f"Ticket: \n\n Link: 127.0.0.1:8000/events/ticket/{urllib.parse.quote(pk)}/ \n\n Event: {event} \n\n Date and time: {event.Date.strftime('%d/%m/%Y, %H:%M:%S')} \n\n Description: {event.Desc} \n\n Your seats: {curlinkage.seats} \n\n For QR code, please visit the link. \n\n Booked on: {curlinkage.whenbooked.strftime('%d/%m/%Y, %H:%M:%S')} \n\n For any queries, please contact the school."
    #fromwhom='suadnastorage@gmail.com'
    recipients=request.user.email
    ezgmail.send(recipients, subject=subject, body=message)
    GI, created = General.objects.get_or_create(pk=1)
    GI.emailsent+=1
    GI.save()
    #send_mail(subject, message, fromwhom, recipients,fail_silently=False)
    curlinkage.emailsent=timezone.now()
    curlinkage.save()
    return(redirect(f'/events/ticket/{pk}/'))

@login_required(login_url='home')
def cancel(request,pk):
    try:
        event=(request.user.linkage_set.get(event__event=pk)).event #event__event is accessing that event(foriegn key)s event(attribute(name))
    except:
        return(redirect('home'))
    curlinkage=linkage.objects.get(user=request.user,event=event)
    if event not in [i.event for i in request.user.linkage_set.all()]:
        return(redirect('home'))
    if curlinkage.seats==None:#if not booked, send home.
        return(redirect('home'))
    if curlinkage.seats not in event.blocked:#If its not there, we dont have to cancel anything. (all these are just fallbacks, JICs)
        return(redirect('home'))
    event.blocked=event.blocked.replace(curlinkage.seats,'')#removing those seats from events blocked seats.
    curlinkage.seats=None#removing seats from curlinkage.
    curlinkage.emailsent=None
    ezgmail.send(request.user.email, subject=f"Cancellation of your seats for {event} on {event.Date.strftime('%d/%m/%Y, %H:%M:%S')}", body=f"Your seats for {event} have been cancelled.\nPlease contact the school for further details.")
    curlinkage.save()
    event.cancels=event.cancels+1
    event.save()
    GI, created = General.objects.get_or_create(pk=1)
    GI.Seatscancelled+=1
    GI.save()
    
    if event.notifymail:
        for i in [j for j in event.notifymail.split(',') if j not in ' ,']:#now we send emails to all those who have been asked to be notified.
            ezgmail.send(i, subject=f"Availability of seats for {event}.", body=f"This is to notify you that a seat may be available for {event} as someone has cancelled their seats.\n\n If you do not wish to be notified about this further, please sign in and click this link: 127.0.0.1:8000/events/cancelnotify/{urllib.parse.quote(pk)}")
    return(redirect('home'))#can change this if wanted.

@user_passes_test(lambda u: u.is_superuser,login_url='home') #if user is admin, let them see this page.
def seatdetails(request,pk):
    event=(events.objects.get(event=pk))
    deets={}
    d={"A":[],"B":[],"C":[],"D":[],"E":[],"F":[],"G":[],"H":[],"I":[],"J":[],"K":[],"L":[],"M":[],"N":[],"O":[],"AA":[],"BB":[],"CC":[],"DD":[],"EE":[],"FF":[],"SA":[],"SB":[],"SC":[],"SD":[],"SE":[],"SF":[],"SG":[],"SH":[],"SI":[],"SJ":[],"SK":[],"SL":[],"SM":[],"SN":[],"SO":[],"SAA":[],"SBB":[],"SCC":[],"SDD":[],"SEE":[],"SFF":[],"RA":[],"RB":[],"RC":[],"RD":[],"RE":[],"RF":[],"RG":[],"RH":[],"RI":[],"RJ":[],"RK":[],"RL":[],"RM":[],"RN":[],"RO":[],"RAA":[],"RBB":[],"RCC":[],"RDD":[],"REE":[],"RFF":[]}
    #keeping default empty values for all so that it can easily be accesed in js without having to worry wether the key exists.
    l=event.blocked.split(',')
    l.pop()    
    for i in l: #traversing the list of booked seats
        link= [k for k in linkage.objects.filter(event=event) if k.seats!=None and i in k.seats.split(',')] #contains only the linkage which booked that seat.
        if link==[]: #reserved seats
            for j in range(len(i)):
                #rendering seats as usual
                if i[j].isdigit():
                    try:
                        temp=d[f"R{i[:j]}"]
                        temp.append(int(i[j:]))
                        d[f"R{i[:j]}"]=temp
                    except:
                        #this shouldnt happen but just in case the admin has entered some bad data in the blocked.
                        d[f"R{i[:j]}"]=[int(i[j:])]
                    break
            deets[i]=None #if this seat is blocked but not through a linkage, then set it as none
        elif link!=[]: #Non reserved seats
            link=link[0] #else, set deets[that seat] as the linkage which was used to book it.
            deets[i]=json.dumps({"event":link.event.event,"USN":link.user.username,"family":f"{link.fami.Parent1}-{link.fami.Parent2}-{link.fami.Guardians}".replace("None","").replace("--", "-").strip("-"),"seats":link.seats,"whenbooked":str(link.whenbooked.strftime("%d/%m/%Y, %H:%M:%S")),"whenmade":str(link.created.strftime("%d/%m/%Y, %H:%M:%S")),"details":link.details,'emailsent':str(link.emailsent.strftime("%d/%m/%Y, %H:%M:%S")),'scannedon':str(link.scanned)}).replace("'", '"')
            if link.scanned!=None: #scanned seats
                for j in range(len(i)):
                    #rendering seats as usual
                    if i[j].isdigit():
                        try:
                            temp=d[f"S{i[:j]}"]
                            temp.append(int(i[j:]))
                            d[f"S{i[:j]}"]=temp
                        except:
                            #this shouldnt happen but just in case the admin has entered some bad data in the blocked.
                            d[f"S{i[:j]}"]=[int(i[j:])]
                        break  
            else: #Booked but not scanned seats  
                for j in range(len(i)):
                    #rendering seats as usual
                    if i[j].isdigit():
                        try:
                            temp=d[i[:j]]
                            temp.append(int(i[j:]))
                            d[i[:j]]=temp
                        except:
                            #this shouldnt happen but just in case the admin has entered some bad data in the blocked.
                            d[i[:j]]=[int(i[j:])]
                        break
    #deets now contains all the booked seats of that event: who booked them. Now, we take this to JS (through hidden form) then there, we call the deets[selectedseat] which is the linkage and then get all the data of the seat from there and display it.
    # d is just so that we can pass the same booked seats of that event in a nice form so aditi can go make the booked things.
    context={"deets":json.dumps(deets).replace("'", '"'),"blocked":json.dumps(d).replace("'", '"'),"event":event}#replaces the '' in the dict to "" so that we can pass it to the js (through the html.)
    return(render(request,'adminaudi.html',context))

@user_passes_test(lambda u: u.is_superuser,login_url='home') #if user is admin, let them see this page.
def report(request,pk):
    event=(events.objects.get(event=pk))
    links=[k for k in linkage.objects.filter(event=event) if k.seats!=None]
    context={'whenupdated':event.updatedon.strftime("%d/%m/%Y, %H:%M:%S"),'scanned':event.scanned,'blocked':len(event.blocked.split(',')),'pplsbooked':len(links),'clicked':event.entered,'cancelled':event.cancels,"event":event.event,'nowaiting':0,'nosiblings':0}
    if event.siblingsbooked:
        context['nosiblings']=len([i for i in event.siblingsbooked.strip('\' ,"').split(',') if i not in '\' ,"'])
    if event.notifymail:
        context['notiymail']=len([i for i in event.notifymail.split(',') if i not in ' ,'])
    deets=[]
    dates={}
    for link in links:
        if dates.get(str(link.whenbooked.date())):
            dates[str(link.whenbooked.date())]+=1
        else:
            dates[str(link.whenbooked.date())]=1
        if link.scanned:
            scnd=str(link.scanned.strftime("%d/%m/%Y, %H:%M:%S"))
        else:
            scnd=''
        deets.append({"USN":link.user.username,"seats":link.seats,"family":f"{link.fami.Parent1}-{link.fami.Parent2}-{link.fami.Guardians}".replace("None","").replace("--", "-").strip("-"),"whenbooked":str(link.whenbooked.strftime("%d/%m/%Y, %H:%M:%S")),"whenmade":str(link.created.strftime("%d/%m/%Y, %H:%M:%S")),"details":link.details,'emailsent':str(link.emailsent.strftime("%d/%m/%Y, %H:%M:%S")),'scan':scnd})
    context['deets']=deets
    l=dates.items()
    dates=[]
    for i in l:
        temp=[]
        for j in i:
            temp.append(j)
        dates.append(temp)
    context['dates']=dates
    return(render(request, 'info.html',context))

@user_passes_test(lambda u: u.is_superuser,login_url='home') #if user is admin, let them see this page.    
def reserve(request,pk): #this was a last minute addition, literally about to have the meeting when i realised this feature could be nice. It is just a workaround, there is a much more efficient way of doin this where it is just in the hallplan() itself.
    context={'pk':pk} #Here, were just blocking the seats as an admin.
    event=(events.objects.get(event=pk))
    if request.method == "POST":
        seats = request.POST.get('seats')  # Get selected seat IDs from POST data
        seats=seats.strip('"')+','
        event=(events.objects.get(event=pk))#refreshing, to check real time, if anyone has booked that justt before this person booked.
        if seats in event.blocked:#If somehow the seats have actually gotten booked just before the person clicked book, then reload the page.
            return(redirect(f"/events/{event.red}"))
        taken=event.blocked
        if taken == None:
            taken=seats
        else:
            taken+=seats
        event.blocked=taken
        event.save()
        return(redirect('home'))
    #see if you can make this more efficient.
    d={"maxseats":69420,"A":[],"B":[],"C":[],"D":[],"E":[],"F":[],"G":[],"H":[],"I":[],"J":[],"K":[],"L":[],"M":[],"N":[],"O":[],"AA":[],"BB":[],"CC":[],"DD":[],"EE":[],"FF":[]}
    #keeping default empty values for all so that it can easily be accesed in js without having to worry wether the key exists.
    s=event.blocked
    l=s.split(',')
    l.pop()
    for i in l: 
        for j in range(len(i)):
            if i[j].isdigit():
                try:
                    temp=d[i[:j]]
                    temp.append(int(i[j:]))
                    d[i[:j]]=temp
                except:
                    #this shouldnt happen but just in case the admin has entered some bad data in the blocked.
                    d[i[:j]]=[int(i[j:])]
                break
    d=json.dumps(d).replace("'", '"') #replaces the '' in the dict to "" so that we can pass it to the js (through the html.)
    context['blocked']=d
    context['event']=event
    return(render(request,'audi.html',context))

@login_required(login_url='home') #this function is another last minute added feauture. If all seats are booked for that event,
def notify(request,pk): #it will send an email to whoever clicks notify my whenever someone cancels and the event gets free.
    #this function is only to add the email ID to notify (in event model). the sending of the emails will happen in cancel.
    context={}
    try:
        event=(request.user.linkage_set.get(event__event=pk)).event #event__event is accessing that event(foriegn key)s event(attribute(name))
    except:
        return(redirect('home'))
    #confirming that it is really full.
    context['allbooked']=(len(event.blocked.split(','))-1==476) #-1 is due to last comma being extra. This is so that we can see if all seats are taken.
    curlinkage=linkage.objects.get(user=request.user,event=event)
    #confirming that the criteria for inform is met. i.e They must not have aldready booked a ticket and they must not have siblings who have booked it.
    #there will be a check in ticket to remove any and all emails that have booked from inform.
    if curlinkage.seats:#if aldready booked, send to ticket.
            return(redirect(f"/events/ticket/{pk}"))
    #checking for siblings.
    fam=Family.objects.get(user=request.user)
    sib=linkage.objects.filter(fami__Parent1=fam.Parent1,fami__Parent2=fam.Parent2,fami__Guardians=fam.Guardians,event=event)
    for i in sib:
        if i.seats is not None:
            curlinkage.event.siblingsbooked+=f"{curlinkage.user.username}:{i.user.username},"
            curlinkage.event.save()
            return(render(request,'siblings.html',{'i':i}))  
        if event not in [i.event for i in request.user.linkage_set.all()]: #just in case
            return(redirect('home'))
    #checking if aldready asked for this.
    if event.notifymail and request.user.email not in event.notifymail.split(','):
        #adding to list.
        event.notifymail+=request.user.email+','
        event.save()
    context['email']=request.user.email
    return(render(request,'notify.html',context))
@login_required(login_url='home')
def cancelnotify(request,pk):
    context={}
    try:
        event=(request.user.linkage_set.get(event__event=pk)).event #event__event is accessing that event(foriegn key)s event(attribute(name))
    except:
        return(redirect('home'))
    if event.notifymail and request.user.email in event.notifymail.split(','): #if the user has asked to notify and has now gotten a seat/seats, remove his name from notify.
        temp=event.notifymail
        event.notifymail=temp.replace(f"{request.user.email},",'')
        event.save()
    return(redirect('home'))

@user_passes_test(lambda u: u.is_superuser,login_url='home') #if user is admin, let them see this page.
def cancelreserve(request,pk):
    context={'pk':pk} #Here, were just blocking the seats as an admin.
    event=(events.objects.get(event=pk))
    if request.method == "POST":
        seats = request.POST.get('seats')  # Get selected seat IDs from POST data
        seats=seats.strip('"')+','
        taken=event.blocked
        for i in seats.strip(' ,').split(','):
            taken=taken.replace(f'{i},','')#removing those seats from events blocked seats.
        event.blocked=taken
        event.save()
        return(redirect('home'))
    d={"RA":[],"RB":[],"RC":[],"RD":[],"RE":[],"RF":[],"RG":[],"RH":[],"RI":[],"RJ":[],"RK":[],"RL":[],"RM":[],"RN":[],"RO":[],"RAA":[],"RBB":[],"RCC":[],"RDD":[],"REE":[],"RFF":[]}
    #keeping default empty values for all so that it can easily be accesed in js without having to worry wether the key exists.
    l=event.blocked.split(',')
    l.pop()    
    for i in l: #traversing the list of booked seats
        link= [k for k in linkage.objects.filter(event=event) if k.seats!=None and i in k.seats.split(',')] #contains only the linkage which booked that seat.
        if link==[]: #reserved seats
            for j in range(len(i)):
                #rendering seats as usual
                if i[j].isdigit():
                    try:
                        temp=d[f"R{i[:j]}"]
                        temp.append(int(i[j:]))
                        d[f"R{i[:j]}"]=temp
                    except:
                        #this shouldnt happen but just in case the admin has entered some bad data in the blocked.
                        d[f"R{i[:j]}"]=[int(i[j:])]
                    break
    if event.notifymail:
        for i in [j for j in event.notifymail.split(',') if j not in ' ,']:#now we send emails to all those who have been asked to be notified.
            ezgmail.send(i, subject=f"Availability of seats for {event}.", body=f"This is to notify you that a seat may be available for {event} as someone has cancelled their seats.\n\n If you do not wish to be notified about this further, please sign in and click this link: 127.0.0.1:8000/events/cancelnotify/{urllib.parse.quote(pk)}")
    #deets now contains all the booked seats of that event: who booked them. Now, we take this to JS (through hidden form) then there, we call the deets[selectedseat] which is the linkage and then get all the data of the seat from there and display it.
    # d is just so that we can pass the same booked seats of that event in a nice form so aditi can go make the booked things.
    context={"blocked":json.dumps(d).replace("'", '"')}#replaces the '' in the dict to "" so that we can pass it to the js (through the html.)
    context['event']=event
    return(render(request,'cancelaudi.html',context))

#REMOVE WHENMADE AND ADD WHICH EMAIL IT HAS BEEN SENT TO IN ADMINAUDI.
#same way replace linkage made on in report

#Change api account so that it says tbsboxoffice.

# reserved, booked, taken (currently its just how many seats taken,
# i want to show how many of those are resered and how many booked), 
# not booked yet, how many booked but not entered yet. All must be added to reports
