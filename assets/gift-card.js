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
      const successMessage =
        $('.cart-gift-card').data('gift-removed-success') || 'Gift card removed successfully';

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

  // Handle gift card image display
  const giftCardImage = giftCardContainer.find('.gift-card-image');
  const giftIconFallback = giftCardContainer.find('.gift-icon-fallback');

  if (giftData.card_design && giftData.card_design.length > 0) {
    giftCardImage.attr('src', giftData.card_design);
    giftCardImage.removeClass('d-none');
    giftIconFallback.addClass('d-none');
  } else {
    giftCardImage.addClass('d-none');
    giftIconFallback.removeClass('d-none');
  }

  // Handle message display
  const messageContainer = giftCardContainer.find('.message-info');

  if (giftData.gift_message && giftData.gift_message.length > 0) {
    giftCardContainer.find('.gift-message').text(giftData.gift_message);
    messageContainer.show();
  } else {
    messageContainer.hide();
  }

  // Handle media link display
  const mediaLinkContainer = giftCardContainer.find('.media-link-info');

  if (giftData.media_link && giftData.media_link.length > 0) {
    giftCardContainer.find('.gift-media-link').text(giftData.media_link);
    mediaLinkContainer.show();
  } else {
    mediaLinkContainer.hide();
  }

  giftCardContainer.show();
  updateGiftButtonText(true);
}

function updateGiftButtonText(hasGift) {
  const giftButton = $('button[onclick="window.gift_dialog.open()"]');

  if (giftButton.length > 0) {
    giftButton.removeClass('gift-added gift-send');
    const editLink = giftButton.find('.gift-edit-link');

    if (hasGift) {
      giftButton.addClass('gift-added');
      editLink.removeClass('d-none').addClass('d-inline');
    } else {
      giftButton.addClass('gift-send');
      editLink.removeClass('d-inline').addClass('d-none');
    }
  }
}

// Event listener for gift submission
window.addEventListener('vitrin:gift:submitted', async event => {
  const cartData = event?.detail?.data;
  const giftData = cartData?.gift_card_details;

  if (giftData) {
    updateGiftCardDisplay(giftData);
    const successMessage = $('.cart-gift-card').data('gift-added-success') || 'Send Successfully';
    const successTitle = null;

    if (typeof toastr !== 'undefined') {
      toastr.success(successMessage, successTitle);
    }
  }
});
