"""
Signal handlers for the accounts app.
Automatically creates UserProfile when a new User is created.
"""

from django.db.models.signals import post_save
from django.dispatch import receiver
from django.contrib.auth.models import User
from .models import UserProfile


@receiver(post_save, sender=User)
def create_user_profile(sender, instance, created, **kwargs):
    """
    Create a UserProfile when a new User is created.
    
    Args:
        sender: The User model class
        instance: The User instance being saved
        created: Boolean indicating if the instance was just created
        **kwargs: Additional keyword arguments
    """
    if created:
        # Only create profile if it doesn't already exist
        UserProfile.objects.get_or_create(
            user=instance,
            defaults={'supabase_uid': ''}
        )


@receiver(post_save, sender=User)
def save_user_profile(sender, instance, **kwargs):
    """
    Save the UserProfile when the User is saved.
    
    Args:
        sender: The User model class
        instance: The User instance being saved
        **kwargs: Additional keyword arguments
    """
    if hasattr(instance, 'profile'):
        instance.profile.save()
