/**
 * Gift Card Management JavaScript
 * Simple and efficient approach - no complex translations or DOM recreation
 */

function editGiftCard() {
  window?.gift_dialog?.open();
}

function deleteGiftCard() {
  const deleteButton = $('.gift-card-delete-btn');
  const deleteIcon = deleteButton.find('.icon-trash-alt');
  const deleteProgress = deleteButton.find('.delete-gift-progress');

  // Prevent multiple clicks
  if (!deleteProgress.hasClass('d-none')) {
    return;
  }

  // Show loading state
  deleteIcon.addClass('d-none');
  deleteProgress.removeClass('d-none');

  window?.zid?.cart
    ?.removeGiftCard({ showErrorNotification: true })
    .then(() => {
      $('.cart-gift-card').hide();
      updateGiftButtonText(false);
      
      // Show success alert - get translation from existing element
      const successMessage = $('.cart-gift-card').data('gift-removed-success') || 'Gift card removed successfully';
      if (typeof toastr !== 'undefined') {
        toastr.success(successMessage);
      }
    })
    .catch(() => {
      // Do nothing
    })
    .finally(() => {
      deleteIcon.removeClass('d-none');
      deleteProgress.addClass('d-none');
    });
}

function updateGiftCardDisplay(giftData) {
  const giftCardContainer = $('.cart-gift-card');

  // Simply update the values - container always exists
  giftCardContainer.find('.sender-name').text(giftData.sender_name || '');
  giftCardContainer.find('.receiver-name').text(giftData.receiver_name || '');
  
  // Handle message display
  const messageContainer = giftCardContainer.find('.message-info');
  if (giftData.gift_message && giftData.gift_message.length > 0) {
    giftCardContainer.find('.gift-message').text(giftData.gift_message);
    messageContainer.show();
  } else {
    messageContainer.hide();
  }

  giftCardContainer.show();
  updateGiftButtonText(true);
}

function updateGiftButtonText(hasGift) {
  const giftButton = $('button[onclick="window.gift_dialog.open()"] span');
  
  if (giftButton.length > 0) {
    if (hasGift) {
      giftButton.text('The order has been added as a gift');
    } else {
      giftButton.text('Send as a gift');
    }
  }
}

// Event listener for gift submission
window.addEventListener('vitrin:gift:submitted', async event => {
  const cartData = event?.detail?.data;
  const giftData = cartData?.gift_card_details;

  if (giftData) {
    updateGiftCardDisplay(giftData);
  }
});