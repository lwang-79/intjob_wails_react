import { 
  AlertDialog, 
  AlertDialogBody, 
  AlertDialogContent, 
  AlertDialogFooter, 
  AlertDialogHeader, 
  AlertDialogOverlay, 
  Button 
} from "@chakra-ui/react"

interface DeleteAlertProps {
  name: string
  cancelRef: React.MutableRefObject<any>
  isOpen: boolean
  onClose: () => void
  onDelete: () => void
}
function DeleteAlert({ name, cancelRef, isOpen, onClose, onDelete }: DeleteAlertProps) {
  return (
    <AlertDialog
      isOpen={isOpen}
      leastDestructiveRef={cancelRef}
      onClose={onClose}
    >
      <AlertDialogOverlay>
        <AlertDialogContent>
          <AlertDialogHeader fontSize='lg' fontWeight='bold'>
            Delete {name}
          </AlertDialogHeader>

          <AlertDialogBody>
            Are you sure? You can not undo this action afterwards.
          </AlertDialogBody>

          <AlertDialogFooter>
            <Button
              ref={cancelRef} 
              onClick={onClose}
              px={6}
            >
              Cancel
            </Button>
            <Button
              colorScheme='red' 
              px={6}
              onClick={onDelete} 
              ml={3}
            >
              Delete
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialogOverlay>
    </AlertDialog>
  )
}

export default DeleteAlert
