from backend.types import TrackedAccountWithHF

class Notifier:
    def notify_of_health_factor(self, account: TrackedAccountWithHF, health_factor: float):
        ...
    
    def notify_of_liquidation(self, account: ...):
        ...